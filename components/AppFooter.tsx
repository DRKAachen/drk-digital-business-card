import Link from 'next/link'
import styles from './AppFooter.module.scss'

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || 'Deutsches Rotes Kreuz'

/**
 * Custom app footer with only the links we need (Impressum + Datenschutz).
 * Replaces the design system Footer which hardcodes AGB and Cookie links.
 */
export default function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <nav aria-label="Footer-Navigation">
          <ul className={styles.links}>
            <li>
              <Link href="/impressum" className={styles.link}>Impressum</Link>
            </li>
            <li>
              <Link href="/datenschutz" className={styles.link}>Datenschutz</Link>
            </li>
          </ul>
        </nav>
        <p className={styles.copyright}>
          &copy; {currentYear} {orgName}
        </p>
      </div>
    </footer>
  )
}
