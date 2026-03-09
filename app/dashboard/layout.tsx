import Link from 'next/link'
import Image from 'next/image'
import styles from './layout.module.scss'
import LogoutButton from '@/components/auth/LogoutButton'

/**
 * Dashboard layout wraps all authenticated pages.
 * Provides navigation header with links to dashboard sections.
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
            <Image src="/drk-logo.svg" alt="DRK" width={32} height={32} />
            <span>Visitenkarte</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/dashboard" className={styles.navLink}>
              Übersicht
            </Link>
            <Link href="/dashboard/edit" className={styles.navLink}>
              Bearbeiten
            </Link>
            <Link href="/dashboard/qr" className={styles.navLink}>
              QR-Code
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
