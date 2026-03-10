import { Header, type SiteConfig } from '@drkaachen/design-system-ui'
import AppFooter from '@/components/AppFooter'

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || 'Deutsches Rotes Kreuz'

/**
 * Shell layout: wraps pages with the DRK design system Header and custom AppFooter.
 * Used by all pages except the landing page (which renders standalone).
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

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header site={siteConfig} />
      <main id="main-content">{children}</main>
      <AppFooter />
    </>
  )
}
