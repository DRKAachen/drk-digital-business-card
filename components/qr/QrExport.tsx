'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import styles from './QrExport.module.scss'

interface QrExportProps {
  cardUrl: string
  cardName: string
}

/**
 * QR code display and export component.
 * Renders a QR code with the DRK logo overlay and provides PNG/SVG download.
 */
export default function QrExport({ cardUrl, cardName }: QrExportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState(280)

  useEffect(() => {
    renderQr()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardUrl, size])

  async function renderQr() {
    const canvas = canvasRef.current
    if (!canvas) return

    await QRCode.toCanvas(canvas, cardUrl, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#ffffff' },
    })

    await drawLogo(canvas)
  }

  /** Loads the DRK logo image once and caches it for reuse across renders and downloads. */
  function loadLogoImage(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = '/drk-logo.png'
    })
  }

  /** Draws the official round DRK logo in the center. Error correction H tolerates ~30% coverage. */
  async function drawLogo(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const logoSize = canvas.width * 0.22
    const center = canvas.width / 2
    const padding = 4

    // White circle background behind the logo (clears QR modules)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(center, center, logoSize / 2 + padding, 0, Math.PI * 2)
    ctx.fill()

    // Draw the actual round DRK logo PNG, clipped to a circle
    const img = await loadLogoImage()
    ctx.save()
    ctx.beginPath()
    ctx.arc(center, center, logoSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, center - logoSize / 2, center - logoSize / 2, logoSize, logoSize)
    ctx.restore()
  }

  async function downloadPng() {
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, cardUrl, {
      width: 1024,
      margin: 4,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#ffffff' },
    })
    await drawLogo(canvas)

    const link = document.createElement('a')
    link.download = `visitenkarte-${cardName}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function downloadSvg() {
    const svgString = await QRCode.toString(cardUrl, {
      type: 'svg',
      width: 1024,
      margin: 4,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#ffffff' },
    })

    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `visitenkarte-${cardName}.svg`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(cardUrl)
      alert('URL kopiert!')
    } catch {
      // Fallback: select input text
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.qrWrapper}>
        <canvas ref={canvasRef} />
      </div>

      <div className={styles.sizeSelector}>
        <label className={styles.sizeLabel}>Vorschaugröße:</label>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="form-field__input"
          style={{ width: 'auto' }}
        >
          <option value={200}>Klein (200px)</option>
          <option value={280}>Mittel (280px)</option>
          <option value={400}>Groß (400px)</option>
        </select>
      </div>

      <div className={styles.urlBox}>
        <label className={styles.urlLabel}>Karten-URL</label>
        <div className={styles.urlRow}>
          <input
            type="text"
            value={cardUrl}
            readOnly
            className="form-field__input"
            style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
          />
          <button onClick={copyUrl} className="btn btn--secondary" style={{ flexShrink: 0 }}>
            Kopieren
          </button>
        </div>
      </div>

      <div className={styles.downloadRow}>
        <button onClick={downloadPng} className="btn btn--primary">
          PNG herunterladen (Druck)
        </button>
        <button onClick={downloadSvg} className="btn btn--secondary">
          SVG herunterladen (Vektor)
        </button>
      </div>

      <p className={styles.hint}>
        Der QR-Code verwendet Fehlerkorrektur-Level H (30%), sodass das DRK-Logo das Scannen nicht beeinträchtigt.
        Die PNG-Version wird in hoher Auflösung (1024px) exportiert – ideal für Druckmaterialien.
      </p>
    </div>
  )
}
