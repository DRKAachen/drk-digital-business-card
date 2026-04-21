'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'
import SupportButton from '@/components/support/SupportButton'
import styles from './MobileMenu.module.scss'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Übersicht' },
  { href: '/dashboard/edit', label: 'Bearbeiten' },
  { href: '/dashboard/qr', label: 'QR-Code' },
  { href: '/dashboard/settings', label: 'Konto' },
]

/**
 * Mobile hamburger menu for the dashboard navigation.
 * Shows a toggle button on small screens that opens a slide-down menu.
 * Automatically closes on route change.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        className={styles.burger}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={open}
      >
        <span className={`${styles.burgerLine} ${open ? styles.burgerLineTop : ''}`} />
        <span className={`${styles.burgerLine} ${open ? styles.burgerLineMid : ''}`} />
        <span className={`${styles.burgerLine} ${open ? styles.burgerLineBot : ''}`} />
      </button>

      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden />
      )}

      <nav className={`${styles.menu} ${open ? styles.menuOpen : ''}`} aria-label="Mobile Navigation">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.menuLink} ${pathname === item.href ? styles.menuLinkActive : ''}`}
          >
            {item.label}
          </Link>
        ))}
        <div className={styles.menuFooter}>
          <SupportButton variant="primary" className={styles.menuSupport} />
          <LogoutButton />
        </div>
      </nav>
    </>
  )
}
