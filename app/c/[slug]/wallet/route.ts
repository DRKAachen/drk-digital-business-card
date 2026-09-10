import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSiteUrl } from '@/lib/url'
import { generateWalletPass, isWalletConfigured } from '@/lib/wallet'
import type { CardRow } from '@/lib/types'

interface RouteContext {
params: Promise<{ slug: string }>
}

/**
* Liefert einen signierten Apple-Wallet-Pass (.pkpass) für eine veröffentlichte Karte.
* Wird über „Zu Apple Wallet hinzufügen" aufgerufen. Safari/iOS erkennt den MIME-Typ
* und öffnet automatisch den nativen „Hinzufügen"-Dialog.
*/
export async function GET(_request: Request, context: RouteContext) {
const { slug } = await context.params

if (!isWalletConfigured()) {
return NextResponse.json({ error: 'Apple Wallet ist nicht konfiguriert' }, { status: 503 })
}

const card: CardRow | null = await prisma.card.findFirst({
where: { slug, is_published: true },
})

if (!card) {
return NextResponse.json({ error: 'Karte nicht gefunden' }, { status: 404 })
}

try {
const cardUrl = `${getSiteUrl()}/c/${card.slug}`
const pkpass = await generateWalletPass(card, cardUrl)
const filename = `${card.first_name}_${card.last_name}.pkpass`

return new NextResponse(new Uint8Array(pkpass), {
headers: {
'Content-Type': 'application/vnd.apple.pkpass',
'Content-Disposition': `attachment; filename="${filename}"`,
'Cache-Control': 'no-store',
},
})
} catch (err) {
console.error('[wallet] Pass-Erstellung fehlgeschlagen:', err)
return NextResponse.json({ error: 'Pass-Erstellung fehlgeschlagen' }, { status: 500 })
}
}
