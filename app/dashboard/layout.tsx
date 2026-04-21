import Link from 'next/link'
import Image from 'next/image'
import styles from './layout.module.scss'
import LogoutButton from '@/components/auth/LogoutButton'
import MobileMenu from '@/components/nav/MobileMenu'
import SupportButton from '@/components/support/SupportButton'

/**
 * Dashboard layout wraps all authenticated pages.
 * Provides navigation header with desktop nav links and a mobile hamburger menu.
 * Auth protection is handled by middleware.ts (redirects to /login if unauthenticated).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/dashboard" className={styles.brand}>
            <Image src="/drk-logo.png" alt="DRK" width={36} height={36} />
            <span>Visitenkarte</span>
          </Link>
          <nav className={styles.desktopNav}>
            <Link href="/dashboard" className={styles.navLink}>
              Übersicht
            </Link>
            <Link href="/dashboard/edit" className={styles.navLink}>
              Bearbeiten
            </Link>
            <Link href="/dashboard/qr" className={styles.navLink}>
              QR-Code
            </Link>
            <Link href="/dashboard/settings" className={styles.navLink}>
              Konto
            </Link>
          </nav>
          <div className={styles.desktopActions}>
            <SupportButton variant="primary" />
            <LogoutButton />
          </div>
          <MobileMenu />
        </div>
      </header>
      <div className={styles.content}>{children}</div>
      <footer className={styles.footer}>
        <Link href="/impressum">Impressum</Link>
        <Link href="/datenschutz">Datenschutz</Link>
        <SupportButton variant="link" />
      </footer>
    </div>
  )
}
