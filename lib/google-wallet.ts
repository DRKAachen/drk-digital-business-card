export function getGoogleWalletConfig(): GoogleWalletConfig {
  const rawKey = process.env.GOOGLE_WALLET_PRIVATE_KEY || '';
  
  console.log('🔍 DEBUG:');
  console.log('ISSUER:', process.env.GOOGLE_WALLET_ISSUER_ID ? '✅' : '❌');
  console.log('RAW KEY length:', rawKey.length);
  console.log('RAW KEY starts with:', rawKey.substring(0, 50));
  
  const config = {
    issuerId: process.env.GOOGLE_WALLET_ISSUER_ID || '',
    serviceAccountEmail: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL || '',
    privateKeyId: process.env.GOOGLE_WALLET_PRIVATE_KEY_ID || '',
    privateKey: rawKey.replace(/\\n/g, '\n'),
    projectId: process.env.GOOGLE_WALLET_PROJECT_ID || '',
  };

  if (!config.issuerId || !config.privateKey) {
    throw new Error('Google Wallet config incomplete');
  }

  return config;
}