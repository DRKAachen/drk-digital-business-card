import Link from 'next/link'
import styles from './layout.module.scss'
import LogoutButton from '@/components/auth/LogoutButton'

/**
 * Dashboard layout: adds a sub-navigation bar for authenticated pages.
 * The global Header/Footer comes from the root layout (design system).
 * Auth protection is handled by middleware.ts.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.layout}>
      <nav className={styles.subNav} aria-label="Dashboard-Navigation">
        <div className={styles.subNavInner}>
          <div className={styles.navLinks}>
            <Link href="/dashboard" className={styles.navLink}>
              Übersicht
            </Link>
            <Link href="/dashboard/edit" className={styles.navLink}>
              Bearbeiten
            </Link>
            <Link href="/dashboard/qr" className={styles.navLink}>
              QR-Code
            </Link>
          </div>
          <LogoutButton />
        </div>
      </nav>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
