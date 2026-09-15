import jwt from 'jsonwebtoken';
console.log('DEBUG: GOOGLE_WALLET_PRIVATE_KEY exists?', !!process.env.GOOGLE_WALLET_PRIVATE_KEY);
console.log('DEBUG: GOOGLE_WALLET_PRIVATE_KEY length:', (process.env.GOOGLE_WALLET_PRIVATE_KEY || '').length);
console.log('DEBUG: Key starts with:', (process.env.GOOGLE_WALLET_PRIVATE_KEY || '').substring(0, 30));
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

export function getGoogleWalletConfig(): GoogleWalletConfig {
  const config = {
    issuerId: process.env.GOOGLE_WALLET_ISSUER_ID || '',
    serviceAccountEmail: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL || '',
    privateKeyId: process.env.GOOGLE_WALLET_PRIVATE_KEY_ID || '',
    privateKey: (process.env.GOOGLE_WALLET_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    projectId: process.env.GOOGLE_WALLET_PROJECT_ID || '',
  };

  if (!config.issuerId || !config.privateKey) {
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

  const payload = {
    iss: config.serviceAccountEmail,
    aud: 'google',
    origins: ['localhost', process.env.NEXT_PUBLIC_APP_URL || ''],
    typ: 'savetowallet',
    payload: {
      genericObjects: [
        {
          id: `${config.issuerId}.${cardSlug}`,
          classId: `${config.issuerId}.drk_card`,
          genericType: 'GENERIC_V2',
          hexBackgroundColor: isOwner ? '#e20019' : '#1c252a',
          cardTitle: {
            defaultValue: {
              language: 'en',
              value: passData.name || 'DRK Card',
            },
          },
          subheader: {
            defaultValue: {
              language: 'en',
              value: passData.title || 'Mitglied',
            },
          },
          header: {
            defaultValue: {
              language: 'en',
              value: 'DRK Digital',
            },
          },
          textModulesData: [
            {
              id: 'email',
              header: 'E-Mail',
              body: passData.email,
            },
            {
              id: 'phone',
              header: 'Telefon',
              body: passData.phone || '',
            },
          ],
          barcode: {
            type: 'QR_CODE',
            value: `https://drk-visitenkarte.de/c/${cardSlug}`,
          },
          logo: {
            sourceUri: {
              uri: `${process.env.NEXT_PUBLIC_APP_URL}/drk-logo.png`,
            },
          },
        },
      ],
    },
  };

  const token = jwt.sign(payload, config.privateKey, {
    algorithm: 'RS256',
    keyid: config.privateKeyId,
    expiresIn: '1h',
  });

  return token;
}