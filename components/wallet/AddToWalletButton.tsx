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
* Button „Hinzufügen zu Apple Wallet".
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
<a href={walletUrl} className={styles.button} aria-label="Zu Apple Wallet hinzufügen">
<WalletIcon />
<span className={styles.text}>
<span className={styles.small}>Hinzufügen zu</span>
<span className={styles.big}>Apple Wallet</span>
</span>
</a>
)
}

/** Stilisiertes Wallet-Symbol (farbige Karten), SVG inline ohne externe Datei */
function WalletIcon() {
return (
<svg className={styles.icon} viewBox="0 0 40 40" aria-hidden="true">
<rect x="4" y="9" width="32" height="24" rx="4" fill="#fff" opacity="0.15" />
<rect x="4" y="13" width="32" height="20" rx="4" fill="#4cd964" />
<rect x="4" y="17" width="32" height="16" rx="4" fill="#ffcc00" />
<rect x="4" y="21" width="32" height="12" rx="4" fill="#ff9500" />
<rect x="4" y="25" width="32" height="8" rx="4" fill="#ff3b30" />
</svg>
)
}
