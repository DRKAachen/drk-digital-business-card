'use client'

import { signOut } from 'next-auth/react'

/**
 * Logout button that ends the Auth.js session and redirects to the landing page.
 */
export default function LogoutButton() {
  function handleLogout() {
    signOut({ callbackUrl: '/' })
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
