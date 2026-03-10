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

    drawLogo(canvas)
  }

  /** Draws the DRK logo in the center: red cross on white. Error correction H tolerates ~30% coverage. */
  function drawLogo(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const logoSize = canvas.width * 0.18
    const center = canvas.width / 2
    const padding = 4

    // Light gray border circle (subtle outline)
    ctx.fillStyle = '#E5E5E5'
    ctx.beginPath()
    ctx.arc(center, center, logoSize / 2 + padding + 1, 0, Math.PI * 2)
    ctx.fill()

    // White circle background
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(center, center, logoSize / 2 + padding, 0, Math.PI * 2)
    ctx.fill()

    // Red cross
    const barWidth = logoSize * 0.24
    const barHeight = logoSize * 0.6
    ctx.fillStyle = '#E30613'
    ctx.fillRect(center - barWidth / 2, center - barHeight / 2, barWidth, barHeight)
    ctx.fillRect(center - barHeight / 2, center - barWidth / 2, barHeight, barWidth)
  }

  async function downloadPng() {
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, cardUrl, {
      width: 1024,
      margin: 4,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#ffffff' },
    })
    drawLogo(canvas)

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
