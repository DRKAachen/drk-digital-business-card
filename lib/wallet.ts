import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import { PKPass } from 'passkit-generator'
import type { CardRow } from '@/lib/types'

const PASS_TYPE_ID = process.env.WALLET_PASS_TYPE_ID ?? ''
const TEAM_ID = process.env.WALLET_TEAM_ID ?? ''

/** Vrai seulement si les 5 variables WALLET_* sont définies. Sinon le bouton est caché. */
export function isWalletConfigured(): boolean {
  return !!(
    PASS_TYPE_ID &&
    TEAM_ID &&
    process.env.WALLET_SIGNER_CERT &&
    process.env.WALLET_SIGNER_KEY &&
    process.env.WALLET_WWDR_CERT
  )
}

/** Les certificats sont stockés en base64 dans les variables d'env (pas de fichiers sur le serveur). */
function fromBase64(name: string): Buffer {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var ${name}`)
  return Buffer.from(value, 'base64')
}

let imageCache: Record<string, Buffer> | null = null

/** Charge les PNG de public/wallet une seule fois. */
function loadImages(): Record<string, Buffer> {
  if (imageCache) return imageCache
  const dir = path.join(process.cwd(), 'public', 'wallet')
  const images: Record<string, Buffer> = {}
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith('.png')) images[file] = fs.readFileSync(path.join(dir, file))
  }
  imageCache = images
  return images
}

/** Maskiert HTML-Sonderzeichen, damit Werte das Markup in attributedValue nicht zerlegen. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Baut ein <a>-Element für attributedValue. Beide Seiten werden maskiert. */
function link(href: string, text: string): string {
  return `<a href='${escapeHtml(href)}'>${escapeHtml(text)}</a>`
}

/** Ergänzt https://, wenn der Nutzer die URL ohne Schema eingetragen hat. */
function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

/** Kürzt eine URL für die Anzeige: ohne Schema, ohne www., ohne Schrägstrich am Ende. */
function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
}

/** Reduziert eine Telefonnummer auf das, was in einem tel:-Link erlaubt ist. */
function telHref(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

/** Construit et signe le .pkpass pour une carte. Le QR code dedans = l'URL publique de la carte. */
export async function generateWalletPass(card: CardRow, cardUrl: string): Promise<Buffer> {
  const fullName = `${card.first_name} ${card.last_name}`

  const pass = new PKPass(
    loadImages(),
    {
      wwdr: fromBase64('WALLET_WWDR_CERT'),
      signerCert: fromBase64('WALLET_SIGNER_CERT'),
      signerKey: fromBase64('WALLET_SIGNER_KEY'),
    },
    {
      formatVersion: 1,
      passTypeIdentifier: PASS_TYPE_ID,
      teamIdentifier: TEAM_ID,
      serialNumber: card.id,
      organizationName: card.organization || 'Deutsches Rotes Kreuz',
      description: `DRK Visitenkarte – ${fullName}`,
      logoText: 'Deutsches Rotes Kreuz',
      foregroundColor: 'rgb(255,255,255)',
      backgroundColor: 'rgb(226,0,26)',
      labelColor: 'rgb(255,220,220)',
    }
  )

  pass.type = 'generic'

  // Recto
  pass.primaryFields.push({ key: 'name', label: 'NAME', value: fullName })
  if (card.title) pass.secondaryFields.push({ key: 'title', label: 'POSITION', value: card.title })
  if (card.organization) pass.auxiliaryFields.push({ key: 'org', label: 'ORGANISATION', value: card.organization })

  /*
   * Kartendetails (frühere "Rückseite", seit iOS 16 unter „Kartendetails").
   *
   * Nur hier sind Links erlaubt: Apple rendert in `attributedValue` ein
   * kleines HTML-Subset inklusive <a href>. Feldwerte auf der Vorderseite
   * sind dagegen immer reiner Text und können nicht anklickbar sein.
   *
   * `value` bleibt als Rückfallebene gesetzt (Apple verlangt es und nutzt es
   * überall dort, wo attributedValue nicht gerendert wird). Wo wir einen
   * eigenen Link setzen, schalten wir die automatische Erkennung über
   * `dataDetectorTypes: []` ab, damit iOS nicht zusätzlich verlinkt.
   */
  if (card.email) {
    pass.backFields.push({
      key: 'email',
      label: 'E-Mail',
      value: card.email,
      attributedValue: link(`mailto:${card.email}`, card.email),
      dataDetectorTypes: [],
    })
  }
  if (card.phone) {
    pass.backFields.push({
      key: 'phone',
      label: 'Telefon',
      value: card.phone,
      attributedValue: link(`tel:${telHref(card.phone)}`, card.phone),
      dataDetectorTypes: [],
    })
  }
  if (card.mobile) {
    pass.backFields.push({
      key: 'mobile',
      label: 'Mobil',
      value: card.mobile,
      attributedValue: link(`tel:${telHref(card.mobile)}`, card.mobile),
      dataDetectorTypes: [],
    })
  }

  // Adresse bewusst ohne eigenen Link: iOS erkennt sie selbst und bietet
  // „In Karten öffnen" an, was besser ist als ein fest verdrahteter Maps-Link.
  const address = [card.street, [card.zip, card.city].filter(Boolean).join(' '), card.country]
    .filter(Boolean)
    .join('\n')
  if (address) pass.backFields.push({ key: 'address', label: 'Adresse', value: address })

  if (card.website) {
    pass.backFields.push({
      key: 'web',
      label: 'Webseite',
      value: card.website,
      attributedValue: link(withProtocol(card.website), prettyUrl(card.website)),
      dataDetectorTypes: [],
    })
  }
  if (card.booking_url) {
    pass.backFields.push({
      key: 'booking',
      label: 'Termin',
      value: card.booking_url,
      attributedValue: link(withProtocol(card.booking_url), 'Termin buchen'),
      dataDetectorTypes: [],
    })
  }
  pass.backFields.push({
    key: 'link',
    label: 'Digitale Visitenkarte',
    value: cardUrl,
    attributedValue: link(cardUrl, 'Visitenkarte öffnen'),
    dataDetectorTypes: [],
  })

  /*
   * QR-Code wie auf der gedruckten Karte. Der altText steht direkt unter dem
   * Code und ist die einzige Stelle auf der Vorderseite, an der sich ein
   * Hinweis unterbringen lässt, ohne ein zusätzliches Feld zu belegen.
   */
  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: cardUrl,
    messageEncoding: 'iso-8859-1',
    altText: 'Scannen – alle Kontaktdaten unter „Kartendetails“',
  })

  return pass.getAsBuffer()
}
