import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AccountActions from '@/components/account/AccountActions'

export const metadata = {
  title: 'Konto & Datenschutz',
}

/**
 * Dashboard settings page for account management and DSGVO rights.
 * Provides data export (Art. 20) and account deletion (Art. 17).
 * Password management is handled by Authentik's own UI.
 */
export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Konto &amp; Datenschutz</h1>
      <AccountActions userEmail={session.user.email || ''} />
    </div>
  )
}
