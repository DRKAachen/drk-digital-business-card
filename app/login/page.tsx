import Image from 'next/image'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'
import styles from './page.module.scss'

export const metadata = {
  title: 'Anmelden',
}

/**
 * Login page with magic link authentication.
 */
export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <Image src="/drk-logo.svg" alt="DRK" width={48} height={48} />
        </Link>
        <h1 className={styles.title}>Anmelden</h1>
        <p className={styles.subtitle}>
          Melden Sie sich an, um Ihre digitale Visitenkarte zu erstellen oder zu bearbeiten.
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
