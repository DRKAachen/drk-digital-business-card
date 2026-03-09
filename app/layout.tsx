import type { Metadata } from 'next'
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
  return (
    <html lang="de">
      <body>
        <a href="#main-content" className="sr-only">
          Zum Inhalt springen
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  )
}
