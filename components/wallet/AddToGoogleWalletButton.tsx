'use client'

import { useEffect, useState } from 'react'
import styles from './AddToGoogleWalletButton.module.scss'

interface AddToGoogleWalletButtonProps {
  cardSlug: string
  /** Button immer anzeigen, unabhängig vom Gerät (z. B. im Dashboard des Besitzers) */
  alwaysShow?: boolean
}

const BUTTON_IMAGE = 'https://pay.google.com/about/static/images/brand/wallet_save_button.png'

type Status = 'hidden' | 'loading' | 'ready' | 'error'

/**
 * Button „Zu Google Wallet hinzufügen".
 * Rendert nur auf Android (oder mit alwaysShow). Der JWT wird erst geladen,
 * wenn der Button tatsächlich angezeigt wird.
 */
export function AddToGoogleWalletButton({ cardSlug, alwaysShow = false }: AddToGoogleWalletButtonProps) {
  const [status, setStatus] = useState<Status>('hidden')
  const [saveUrl, setSaveUrl] = useState<string | null>(null)

  useEffect(() => {
    const isAndroid = /android/i.test(navigator.userAgent)
    if (!isAndroid && !alwaysShow) return

    const controller = new AbortController()
    setStatus('loading')

    fetch(`/c/${encodeURIComponent(cardSlug)}/google-wallet`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok || !data.jwt) throw new Error(data.error || `HTTP ${res.status}`)
        setSaveUrl(`https://pay.google.com/gp/v/save/${data.jwt}`)
        setStatus('ready')
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        console.error('[google-wallet] JWT konnte nicht geladen werden:', err)
        setStatus('error')
      })

    return () => controller.abort()
  }, [cardSlug, alwaysShow])

  // Ohne Android oder bei Fehler nichts anzeigen – QR-Code und vCard bleiben verfügbar
  if (status === 'hidden' || status === 'error') return null

  const image = (
    // Offizielles Google-Wallet-Badge, extern gehostet laut Google-Markenrichtlinien
    // eslint-disable-next-line @next/next/no-img-element
    <img src={BUTTON_IMAGE} alt="Zu Google Wallet hinzufügen" className={styles.image} />
  )

  return (
    <div className={styles.container}>
      {status === 'ready' && saveUrl ? (
        <a href={saveUrl} className={styles.button} target="_blank" rel="noopener noreferrer">
          {image}
        </a>
      ) : (
        <button type="button" className={styles.button} disabled aria-busy="true">
          {image}
        </button>
      )}
    </div>
  )
}
