import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import AccountActions from '@/components/account/AccountActions'

export const metadata = {
  title: 'Konto & Datenschutz',
}

/**
 * Dashboard settings page for account management and DSGVO rights.
 * Provides data export (Art. 20) and account deletion (Art. 17).
 */
export default async function SettingsPage() {
  const headerStore = await headers()
  const userId = headerStore.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Konto &amp; Datenschutz</h1>
      <AccountActions userEmail={user?.email || ''} />
    </div>
  )
}
