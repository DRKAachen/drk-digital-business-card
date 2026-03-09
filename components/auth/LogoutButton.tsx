'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Logout button that signs the user out and redirects to the landing page.
 */
export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="btn btn--secondary"
      style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
    >
      Abmelden
    </button>
  )
}
