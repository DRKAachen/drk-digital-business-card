import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.scss'

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || 'Deutsches Rotes Kreuz'

/**
 * Landing page – standalone without global Header/Footer.
 * Renders its own hero, features, and a compact footer.
 */
export default function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Image src="/drk-logo.png" alt="DRK Logo" width={64} height={64} priority />
        <h1 className={styles.title}>Digitale Visitenkarte</h1>
        <p className={styles.subtitle}>{orgName}</p>
        <p className={styles.description}>
          Erstellen Sie Ihre persönliche digitale Visitenkarte mit QR-Code.
          Teilen Sie Ihre Kontaktdaten einfach und modern – per Scan, Link oder Download.
        </p>
        <div className={styles.actions}>
          <Link href="/login" className="btn btn--primary">
            Jetzt Visitenkarte erstellen
          </Link>
        </div>
      </div>

      <section className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📱</div>
          <h3>QR-Code</h3>
          <p>Drucken Sie Ihren QR-Code auf Visitenkarten oder zeigen Sie ihn in Präsentationen.</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>💾</div>
          <h3>Kontakt speichern</h3>
          <p>Besucher können Ihre Kontaktdaten mit einem Klick im Adressbuch speichern.</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔒</div>
          <h3>DSGVO-konform</h3>
          <p>Gehostet in der EU. Sie behalten die volle Kontrolle über Ihre Daten.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <nav>
          <Link href="/impressum">Impressum</Link>
          <span aria-hidden="true">·</span>
          <Link href="/datenschutz">Datenschutz</Link>
        </nav>
        <p>&copy; {new Date().getFullYear()} {orgName}</p>
      </footer>
    </div>
  )
}
