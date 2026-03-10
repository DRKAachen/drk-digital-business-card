import type { Metadata } from 'next'
import { Header, Footer, type SiteConfig } from '@drkaachen/design-system-ui'
import '@drkaachen/design-system-ui/styles/globals.scss'
import '@/styles/app.scss'

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || 'Deutsches Rotes Kreuz'

/**
 * Site configuration for the DRK design system Header/Footer/Navigation.
 * Defines the logo, navigation links, and footer links shared across all pages.
 */
const siteConfig: SiteConfig = {
  _id: 'visitenkarte',
  name: orgName,
  hostname: process.env.NEXT_PUBLIC_SITE_URL || 'localhost',
  defaultLocale: 'de',
  navigation: [
    { label: 'Startseite', href: '/' },
    { label: 'Anmelden', href: '/login' },
  ],
  footerLinks: [],
}

export const metadata: Metadata = {
  title: {
    default: `Digitale Visitenkarte – ${orgName}`,
    template: `%s – ${orgName}`,
  },
  description: `Digitale Visitenkarten für ${orgName}`,
  icons: { icon: '/favicon.svg' },
}

/**
 * Root layout: wraps all pages with the DRK design system Header and Footer.
 * Global styles and fonts come from @drkaachen/design-system-ui.
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
        <Header site={siteConfig} />
        <main id="main-content">{children}</main>
        <Footer site={siteConfig} />
      </body>
    </html>
  )
}
