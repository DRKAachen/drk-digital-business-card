import type { Metadata } from 'next'
import '@drkaachen/design-system-ui/styles/globals.scss'
import '@/styles/app.scss'

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
 * Root layout: provides HTML shell and global styles only.
 * Header/Footer are added by the (shell) route group layout for pages that need them.
 * The landing page (app/page.tsx) renders standalone without Header/Footer.
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
        {children}
      </body>
    </html>
  )
}
