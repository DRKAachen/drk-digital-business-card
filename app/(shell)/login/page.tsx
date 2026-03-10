import { DrkLogo } from '@drkaachen/design-system-ui'
import LoginForm from '@/components/auth/LoginForm'
import styles from './page.module.scss'

export const metadata = {
  title: 'Anmelden',
}

/**
 * Login page with magic link authentication.
 * Uses the official DRK logo from the design system.
 */
export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <DrkLogo size={48} />
        <h1 className={styles.title}>Anmelden</h1>
        <p className={styles.subtitle}>
          Melden Sie sich an, um Ihre digitale Visitenkarte zu erstellen oder zu bearbeiten.
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
