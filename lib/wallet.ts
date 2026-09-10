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

  // Verso (le "i" en haut à droite du pass)
  if (card.email) pass.backFields.push({ key: 'email', label: 'E-Mail', value: card.email })
  if (card.phone) pass.backFields.push({ key: 'phone', label: 'Telefon', value: card.phone })
  if (card.mobile) pass.backFields.push({ key: 'mobile', label: 'Mobil', value: card.mobile })
  const address = [card.street, [card.zip, card.city].filter(Boolean).join(' '), card.country]
    .filter(Boolean)
    .join('\n')
  if (address) pass.backFields.push({ key: 'address', label: 'Adresse', value: address })
  if (card.website) pass.backFields.push({ key: 'web', label: 'Webseite', value: card.website })
  if (card.booking_url) pass.backFields.push({ key: 'booking', label: 'Termin buchen', value: card.booking_url })
  pass.backFields.push({ key: 'link', label: 'Digitale Visitenkarte', value: cardUrl })

  // QR code identique à celui de la carte imprimée
  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: cardUrl,
    messageEncoding: 'iso-8859-1',
    altText: 'Scannen für Kontaktdaten',
  })

  return pass.getAsBuffer()
}
