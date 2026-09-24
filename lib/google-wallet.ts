import 'server-only'
import jwt from 'jsonwebtoken'
import { getSiteUrl } from '@/lib/url'
import type { CardRow } from '@/lib/types'

export interface GoogleWalletConfig {
  issuerId: string
  serviceAccountEmail: string
  privateKeyId: string
  privateKey: string
}

/**
 * Liest den privaten Schlüssel. Bevorzugt die base64-kodierte Variante,
 * weil Zeilenumbrüche in Umgebungsvariablen (z. B. in Coolify) verloren gehen.
 */
function readPrivateKey(): string {
  const b64 = process.env.GOOGLE_WALLET_PRIVATE_KEY_B64
  if (b64) return Buffer.from(b64, 'base64').toString('utf8')
  // Fallback für die lokale Entwicklung mit \n im .env
  return (process.env.GOOGLE_WALLET_PRIVATE_KEY || '').replace(/\\n/g, '\n')
}

let cachedConfig: GoogleWalletConfig | null = null

/** Liest die Konfiguration einmal ein; gibt null zurück, wenn etwas fehlt. */
function loadConfig(): GoogleWalletConfig | null {
  if (cachedConfig) return cachedConfig
  const config: GoogleWalletConfig = {
    issuerId: process.env.GOOGLE_WALLET_ISSUER_ID || '',
    serviceAccountEmail: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL || '',
    privateKeyId: process.env.GOOGLE_WALLET_PRIVATE_KEY_ID || '',
    privateKey: readPrivateKey(),
  }
  if (!config.issuerId || !config.serviceAccountEmail || !config.privateKey) return null
  cachedConfig = config
  return config
}

/** Vrai seulement si les variables GOOGLE_WALLET_* nécessaires sont définies. Sinon le bouton est caché. */
export function isGoogleWalletConfigured(): boolean {
  return loadConfig() !== null
}

/** Objekt-IDs dürfen nur Buchstaben, Ziffern, Punkt, Bindestrich und Unterstrich enthalten. */
function toObjectSuffix(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-')
}

/**
 * Erzeugt den signierten „Save to Google Wallet"-JWT für eine veröffentlichte Karte.
 * Inhalt bewusst schlank: Name, QR-Code und Link zur digitalen Visitenkarte.
 */
export function generateGoogleWalletJWT(card: CardRow): string {
  const config = loadConfig()
  if (!config) throw new Error('Google Wallet config incomplete')

  const siteUrl = getSiteUrl() // immer mit https://, ohne Slash am Ende
  const cardUrl = `${siteUrl}/c/${card.slug}`
  const fullName = `${card.first_name} ${card.last_name}`.trim()

  const payload = {
    iss: config.serviceAccountEmail,
    aud: 'google',
    origins: siteUrl ? [new URL(siteUrl).host] : [],
    typ: 'savetowallet',
    payload: {
      genericObjects: [
        {
          id: `${config.issuerId}.${toObjectSuffix(card.slug)}`,
          classId: `${config.issuerId}.drk_card`,
          hexBackgroundColor: '#e2001a',
          cardTitle: {
            defaultValue: { language: 'de', value: 'Deutsches Rotes Kreuz' },
          },
          header: {
            defaultValue: { language: 'de', value: fullName || 'DRK Visitenkarte' },
          },
          linksModuleData: {
            uris: [{ id: 'card', uri: cardUrl, description: 'Digitale Visitenkarte öffnen' }],
          },
          barcode: {
            type: 'QR_CODE',
            value: cardUrl,
            alternateText: 'Scannen für Kontaktdaten',
          },
          logo: {
            sourceUri: { uri: `${siteUrl}/drk-logo.png` },
            contentDescription: {
              defaultValue: { language: 'de', value: 'DRK Logo' },
            },
          },
        },
      ],
    },
  }

  return jwt.sign(payload, config.privateKey, {
    algorithm: 'RS256',
    ...(config.privateKeyId ? { keyid: config.privateKeyId } : {}),
    expiresIn: '1h',
  })
}
