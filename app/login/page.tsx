import Image from 'next/image'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'
import styles from './page.module.scss'

export const metadata = {
  title: 'Anmelden',
}

/**
 * Login page supporting email/password and magic link authentication.
 */
export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <Image src="/drk-logo.png" alt="DRK" width={56} height={56} />
        </Link>
        <h1 className={styles.title}>Anmelden</h1>
        <p className={styles.subtitle}>
          Melden Sie sich an, um Ihre digitale Visitenkarte zu erstellen oder zu bearbeiten.
        </p>
        <LoginForm />
      </div>
      <nav className={styles.legalLinks} aria-label="Rechtliche Hinweise">
        <Link href="/impressum">Impressum</Link>
        <Link href="/datenschutz">Datenschutz</Link>
      </nav>
    </div>
  )
}
