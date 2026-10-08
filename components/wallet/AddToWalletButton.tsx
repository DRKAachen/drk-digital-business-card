'use client'

import { useEffect, useState } from 'react'
import styles from './AddToWalletButton.module.scss'

interface AddToWalletButtonProps {
  /** URL der /wallet-Route, die die .pkpass-Datei liefert */
  walletUrl: string
  /** Button immer anzeigen, unabhängig vom Gerät (z. B. im Dashboard des Besitzers) */
  alwaysShow?: boolean
}

/** Apple Wallet gibt es nur auf iOS/iPadOS und in Safari auf macOS. */
function supportsAppleWallet(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPadOS meldet sich als Mac
  const isMacSafari =
    /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua)
  return isIOS || isMacSafari
}

/**
 * Button „Zu Apple Wallet hinzufügen".
 *
 * Nutzt Apples offizielles Badge-Artwork (deutsche Fassung, RGB) aus
 * public/badges/. Apples Markenrichtlinien verlangen, dass das Badge
 * unverändert und in Originalproportion verwendet wird — deshalb liegt die
 * SVG als Datei vor und wird nicht nachgebaut, skaliert nur über die Höhe,
 * und der umgebende Link setzt bewusst keinen eigenen Hintergrund, Rahmen
 * oder Radius: das Badge bringt all das selbst mit.
 *
 * Rendert auf Geräten ohne Apple Wallet nichts – Besucher mit Android oder
 * Desktop nutzen weiterhin QR-Code und vCard.
 */
export default function AddToWalletButton({ walletUrl, alwaysShow = false }: AddToWalletButtonProps) {
  const [visible, setVisible] = useState(alwaysShow)

  // Geräteerkennung erst im Browser (nicht beim Server-Rendering)
  useEffect(() => {
    if (!alwaysShow) setVisible(supportsAppleWallet())
  }, [alwaysShow])

  if (!visible) return null

  return (
    <div className={styles.wrapper}>
      <a href={walletUrl} className={styles.badgeLink}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Markenartwork, darf nicht durch
            next/image re-encodiert oder beschnitten werden. */}
        <img
          src="/badges/add-to-apple-wallet-de.svg"
          alt="Zu Apple Wallet hinzufügen"
          className={styles.badge}
          width={110}
          height={34}
        />
      </a>
    </div>
  )
}
