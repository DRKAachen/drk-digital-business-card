import type { Metadata } from 'next'
import SessionProvider from '@/components/providers/SessionProvider'
import '@/styles/globals.scss'

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || 'Deutsches Rotes Kreuz'

export const metadata: Metadata = {
  title: {
    default: `Digitale Visitenkarte – ${orgName}`,
    template: `%s – ${orgName}`,
  },
  description: `Digitale Visitenkarten für ${orgName}`,
  icons: { icon: '/favicon.svg' },
}

/**
 * Root layout that wraps all pages.
 * Provides the base HTML structure, global styles, and skip-to-content link.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Umgebungs-Banner: nur sichtbar, wo die Variable gesetzt ist (Dev/Test);
  // in der Produktivumgebung fehlt sie, dort kann das Banner nie erscheinen.
  const umgebungsHinweis = process.env.UMGEBUNG_HINWEIS
  return (
    <html lang="de">
      <body>
        {umgebungsHinweis && <div className="umgebung-banner">{umgebungsHinweis}</div>}
        <SessionProvider>
          <a href="#main-content" className="sr-only">
            Zum Inhalt springen
          </a>
          <main id="main-content">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
