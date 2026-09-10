/**
* Lokaler Test: erzeugt einen .pkpass mit Beispieldaten,
* ohne Datenbank und ohne laufende App.
* Aufruf: npm run test:wallet
*/
import 'dotenv/config'
import fs from 'node:fs'
import { generateWalletPass, isWalletConfigured } from '../lib/wallet'
import type { CardRow } from '../lib/types'

const card: CardRow = {
id: 'test-001',
user_id: 'user-test',
slug: 'alla-hidri',
first_name: 'Alla',
last_name: 'Hidri',
title: 'Praktikant IT',
organization: 'DRK Kreisverband Städteregion Aachen e.V.',
email: 'alla.hidri@drk-aachen.de',
phone: '+49 241 000000',
mobile: null,
street: 'Hoffmannallee',
zip: '52070',
city: 'Aachen',
country: 'Deutschland',
website: 'https://drk-aachen.de',
linkedin: null,
xing: null,
booking_url: null,
photo_path: null,
is_published: true,
created_at: new Date(),
updated_at: new Date(),
}

async function main() {
if (!isWalletConfigured()) {
console.error('WALLET_*-Variablen fehlen in .env.local')
process.exit(1)
}
const buffer = await generateWalletPass(card, 'https://drk-visitenkarte.de/c/alla-hidri')
fs.writeFileSync('test-wallet.pkpass', buffer)
console.log('test-wallet.pkpass erstellt (' + buffer.length + ' Bytes)')
}

main().catch((err) => {
console.error('', err)
process.exit(1)
})
