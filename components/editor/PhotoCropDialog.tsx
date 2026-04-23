'use client'

import { useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import styles from './PhotoCropDialog.module.scss'

interface PhotoCropDialogProps {
  open: boolean
  imageSrc: string | null
  processing: boolean
  onCancel: () => void
  onConfirm: (cropAreaPixels: Area) => Promise<void> | void
}

/**
 * Modal dialog that lets the user choose a square crop area before upload.
 * Cropping is fixed to a 1:1 aspect ratio because the avatar is always rendered
 * inside a circular frame.
 */
export default function PhotoCropDialog({
  open,
  imageSrc,
  processing,
  onCancel,
  onConfirm,
}: PhotoCropDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [cropAreaPixels, setCropAreaPixels] = useState<Area | null>(null)

  useEffect(() => {
    if (!dialogRef.current) return

    if (open) {
      dialogRef.current.showModal()
    } else if (dialogRef.current.open) {
      dialogRef.current.close()
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCropAreaPixels(null)
  }, [imageSrc, open])

  /** Closes the dialog when the user clicks outside the content area. */
  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current && !processing) {
      onCancel()
    }
  }

  /** Prevents the native dialog from closing while image processing is running. */
  function handleNativeCancel(event: React.SyntheticEvent<HTMLDialogElement, Event>) {
    if (processing) {
      event.preventDefault()
      return
    }

    onCancel()
  }

  async function handleConfirm() {
    if (!cropAreaPixels || processing) return
    await onConfirm(cropAreaPixels)
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleBackdropClick}
      onCancel={handleNativeCancel}
      onClose={() => {
        if (open && !processing) {
          onCancel()
        }
      }}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Foto zuschneiden</h2>
          <p className={styles.description}>
            Verschieben und zoomen Sie das Bild, bis der quadratische Ausschnitt passt.
          </p>
        </div>

        <div className={styles.cropArea}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) => setCropAreaPixels(croppedAreaPixels)}
            />
          )}
        </div>

        <div className={styles.controls}>
          <label htmlFor="photo-zoom" className={styles.zoomLabel}>
            Zoom
          </label>
          <input
            id="photo-zoom"
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className={styles.zoomSlider}
            disabled={processing}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={processing}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleConfirm}
            disabled={!cropAreaPixels || processing}
          >
            {processing ? 'Foto wird optimiert...' : 'Ausschnitt übernehmen'}
          </button>
        </div>
      </div>
    </dialog>
  )
}

