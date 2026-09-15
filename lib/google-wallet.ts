import jwt from 'jsonwebtoken';

interface PassData {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface GoogleWalletConfig {
  issuerId: string;
  serviceAccountEmail: string;
  privateKeyId: string;
  privateKey: string;
  projectId: string;
}

/**
 * Liest den privaten Schlüssel. Bevorzugt die base64-kodierte Variante,
 * weil Zeilenumbrüche in Umgebungsvariablen (z. B. in Coolify) verloren gehen.
 */
function readPrivateKey(): string {
  const b64 = process.env.GOOGLE_WALLET_PRIVATE_KEY_B64;
  if (b64) {
    return Buffer.from(b64, 'base64').toString('utf8');
  }
  // Fallback für die lokale Entwicklung mit \n im .env
  return (process.env.GOOGLE_WALLET_PRIVATE_KEY || '').replace(/\\n/g, '\n');
}

/** Domain ohne Protokoll – Google Wallet erwartet nur den Host. */
function getOrigin(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || '';
  try {
    return new URL(url).host;
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

export function getGoogleWalletConfig(): GoogleWalletConfig {
  const config = {
    issuerId: process.env.GOOGLE_WALLET_ISSUER_ID || '',
    serviceAccountEmail: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL || '',
    privateKeyId: process.env.GOOGLE_WALLET_PRIVATE_KEY_ID || '',
    privateKey: readPrivateKey(),
    projectId: process.env.GOOGLE_WALLET_PROJECT_ID || '',
  };

  if (!config.issuerId || !config.privateKey || !config.serviceAccountEmail) {
    throw new Error('Google Wallet config incomplete');
  }

  return config;
}

export function isGoogleWalletConfigured(): boolean {
  try {
    getGoogleWalletConfig();
    return true;
  } catch {
    return false;
  }
}

export function generateGoogleWalletJWT(
  cardSlug: string,
  passData: PassData,
  isOwner: boolean
): string {
  const config = getGoogleWalletConfig();
  const origin = getOrigin();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  const textModulesData = [
    {
      id: 'email',
      header: 'E-Mail',
      body: passData.email,
    },
  ];

  // Leere Felder weglassen, sonst zeigt Google leere Zeilen an
  if (passData.phone) {
    textModulesData.push({
      id: 'phone',
      header: 'Telefon',
      body: passData.phone,
    });
  }

  const payload = {
    iss: config.serviceAccountEmail,
    aud: 'google',
    origins: origin ? [origin] : [],
    typ: 'savetowallet',
    payload: {
      genericObjects: [
        {
          // Objekt-IDs dürfen nur Buchstaben, Ziffern, Punkt, Bindestrich und Unterstrich enthalten
          id: `${config.issuerId}.${cardSlug.replace(/[^a-zA-Z0-9._-]/g, '-')}`,
          classId: `${config.issuerId}.drk_card`,
          genericType: 'GENERIC_V2',
          // Eigene Karte in DRK-Rot, fremde Karte in Dunkelblau
          hexBackgroundColor: isOwner ? '#e2001a' : '#1c253a',
          cardTitle: {
            defaultValue: {
              language: 'de',
              value: 'Deutsches Rotes Kreuz',
            },
          },
          header: {
            defaultValue: {
              language: 'de',
              value: passData.name || 'DRK Visitenkarte',
            },
          },
          subheader: {
            defaultValue: {
              language: 'de',
              value: passData.title || '',
            },
          },
          textModulesData,
          barcode: {
            type: 'QR_CODE',
            value: `${baseUrl}/c/${cardSlug}`,
            alternateText: 'Scannen für Kontaktdaten',
          },
          logo: {
            sourceUri: {
              uri: `${baseUrl}/drk-logo.png`,
            },
            contentDescription: {
              defaultValue: {
                language: 'de',
                value: 'DRK Logo',
              },
            },
          },
        },
      ],
    },
  };

  return jwt.sign(payload, config.privateKey, {
    algorithm: 'RS256',
    keyid: config.privateKeyId,
    expiresIn: '1h',
  });
}