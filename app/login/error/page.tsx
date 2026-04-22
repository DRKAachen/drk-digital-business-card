import Image from 'next/image'
import Link from 'next/link'
import RetryLoginButton from '@/components/auth/RetryLoginButton'
import SupportButton from '@/components/support/SupportButton'
import styles from './page.module.scss'

export const metadata = {
  title: 'Anmeldung nicht abgeschlossen',
}

/**
 * Maps the Auth.js v5 error codes that may arrive on `?error=` to a
 * friendly German title + description. The most common one in our
 * Authentik setup is `Configuration`, which Auth.js uses for the
 * internal `InvalidCheck: pkceCodeVerifier` error — this happens when
 * the PKCE cookie is missing at callback time, usually because the
 * user continued the flow in a different browser (e.g. opened the
 * Authentik confirmation mail on their phone while starting the
 * login on desktop) or waited longer than the 15-minute cookie TTL.
 */
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Anmeldung nicht abgeschlossen',
    description:
      'Ihre Login-Sitzung ist abgelaufen oder wurde in einem anderen Browser bzw. einer anderen App fortgesetzt. ' +
      'Bitte starten Sie die Anmeldung erneut – öffnen Sie den Bestätigungslink aus der E-Mail am besten im selben Browser, in dem Sie den Login begonnen haben.',
  },
  AccessDenied: {
    title: 'Zugriff verweigert',
    description:
      'Ihr Konto hat keine Berechtigung für diese Anwendung. Bitte wenden Sie sich an das Digitalisierungsteam, falls Sie Zugang benötigen.',
  },
  Verification: {
    title: 'Bestätigungslink ungültig',
    description:
      'Der Bestätigungslink ist abgelaufen oder wurde bereits verwendet. Bitte starten Sie die Anmeldung erneut.',
  },
  Callback: {
    title: 'Anmeldung fehlgeschlagen',
    description:
      'Die Antwort vom Authentifizierungsserver konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.',
  },
}

const DEFAULT_MESSAGE = {
  title: 'Anmeldung fehlgeschlagen',
  description:
    'Bei der Anmeldung ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut. Falls das Problem weiterhin besteht, nutzen Sie den Support-Link unten.',
}

interface PageProps {
  /**
   * Next 15 delivers searchParams asynchronously. Auth.js sends the
   * error slug on `?error=<Code>` and, if the user came from an
   * interrupted flow, optionally a `?callbackUrl=…` we preserve.
   */
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}

/**
 * Custom Auth.js error page.
 *
 * Wired via `pages.error` in [lib/auth.config.ts](lib/auth.config.ts).
 * Visually mirrors the /login page so users land in a familiar layout
 * and can simply click "Erneut anmelden" to start a fresh PKCE flow.
 */
export default async function AuthErrorPage({ searchParams }: PageProps) {
  const { error, callbackUrl } = await searchParams
  const message = (error && ERROR_MESSAGES[error]) || DEFAULT_MESSAGE

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <Image src="/drk-logo.png" alt="DRK" width={56} height={56} />
        </Link>
        <h1 className={styles.title}>{message.title}</h1>
        <p className={styles.subtitle}>{message.description}</p>
        <div className={styles.actions}>
          <RetryLoginButton callbackUrl={callbackUrl || '/dashboard'} />
          <Link href="/" className={styles.backLink}>
            Zurück zur Startseite
          </Link>
        </div>
        {error && (
          <p className={styles.technical}>
            Technischer Fehlercode: <code>{error}</code>
          </p>
        )}
      </div>
      <nav className={styles.legalLinks} aria-label="Rechtliche Hinweise">
        <Link href="/impressum">Impressum</Link>
        <Link href="/datenschutz">Datenschutz</Link>
        <SupportButton variant="link" />
      </nav>
    </div>
  )
}
