'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug, isValidSlug } from '@/lib/slug'
import { validatePhoto, ACCEPTED_PHOTO_TYPES, getPhotoExtension } from '@/lib/photo'
import {
  validateSourcePhoto,
  createOptimizedPhotoFile,
} from '@/lib/photo-client'
import type { CardRow } from '@/lib/types'
import type { Area } from 'react-easy-crop'
import PhotoCropDialog from './PhotoCropDialog'
import styles from './CardForm.module.scss'

interface CardFormProps {
  /** Existing card data when editing, null when creating */
  existingCard: CardRow | null
}

/**
 * Card editor form supporting both create and update operations.
 * Handles all contact fields, photo upload via /api/photos/upload,
 * and card persistence via /api/cards. User identity is resolved
 * server-side from the Auth.js session in the API routes.
 */
export default function CardForm({ existingCard }: CardFormProps) {
  const router = useRouter()
  const isEditing = !!existingCard

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const siteUrl = rawUrl && !/^https?:\/\//i.test(rawUrl) ? `https://${rawUrl}` : rawUrl

  const [form, setForm] = useState({
    first_name: existingCard?.first_name ?? '',
    last_name: existingCard?.last_name ?? '',
    slug: existingCard?.slug ?? '',
    title: existingCard?.title ?? '',
    organization: existingCard?.organization ?? 'Deutsches Rotes Kreuz',
    email: existingCard?.email ?? '',
    phone: existingCard?.phone ?? '',
    mobile: existingCard?.mobile ?? '',
    street: existingCard?.street ?? '',
    city: existingCard?.city ?? '',
    zip: existingCard?.zip ?? '',
    country: existingCard?.country ?? 'Deutschland',
    website: existingCard?.website ?? '',
    linkedin: existingCard?.linkedin ?? '',
    xing: existingCard?.xing ?? '',
    is_published: existingCard?.is_published ?? false,
  })

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoMasterFile, setPhotoMasterFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [photoSourceFile, setPhotoSourceFile] = useState<File | null>(null)
  const [photoSourceUrl, setPhotoSourceUrl] = useState<string | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [photoProcessing, setPhotoProcessing] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)

  /** Set initial photo preview from existing card */
  useEffect(() => {
    if (existingCard?.photo_path) {
      const url = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${existingCard.photo_path}`
      setPhotoPreview(url)
    }
  }, [existingCard?.photo_path])

  /** Releases temporary preview URLs when they are replaced or the form unmounts. */
  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  /** Releases the temporary source image URL used inside the crop dialog. */
  useEffect(() => {
    return () => {
      if (photoSourceUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(photoSourceUrl)
      }
    }
  }, [photoSourceUrl])

  /** Auto-generate slug from name when creating a new card */
  useEffect(() => {
    if (!isEditing && form.first_name && form.last_name) {
      const newSlug = generateSlug(form.first_name, form.last_name)
      setForm((prev) => ({ ...prev, slug: newSlug }))
    }
  }, [form.first_name, form.last_name, isEditing])

  /** Check slug availability via API (debounced) */
  const checkSlugAvailability = useCallback(
    async (slug: string) => {
      if (!isValidSlug(slug)) {
        setSlugAvailable(null)
        return
      }
      if (isEditing && slug === existingCard?.slug) {
        setSlugAvailable(true)
        return
      }

      const params = new URLSearchParams({ slug })
      if (isEditing && existingCard?.id) {
        params.set('excludeId', existingCard.id)
      }

      const res = await fetch(`/api/cards/check-slug?${params}`)
      const data = await res.json()
      setSlugAvailable(data.available)
    },
    [isEditing, existingCard?.slug, existingCard?.id],
  )

  useEffect(() => {
    if (!form.slug) return
    const timer = setTimeout(() => checkSlugAvailability(form.slug), 400)
    return () => clearTimeout(timer)
  }, [form.slug, checkSlugAvailability])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setPhotoError(null)

    e.target.value = ''

    if (!file) return

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Nur JPEG, PNG und WebP Dateien sind erlaubt.')
      return
    }

    const validationError = validateSourcePhoto(file)
    if (validationError) {
      setPhotoError(validationError)
      return
    }

    setPhotoMasterFile(file)
    setPhotoSourceFile(file)
    setPhotoSourceUrl(URL.createObjectURL(file))
    setCropOpen(true)
  }

  /** Reopens the crop flow either from the unsaved local photo or the stored photo. */
  async function handlePhotoEdit() {
    setPhotoError(null)

    if (photoMasterFile) {
      setPhotoSourceFile(photoMasterFile)
      setPhotoSourceUrl(URL.createObjectURL(photoMasterFile))
      setCropOpen(true)
      return
    }

    if (!existingCard?.photo_path) return

    setPhotoLoading(true)

    try {
      const response = await fetch(
        `/api/photos/source?path=${encodeURIComponent(existingCard.photo_path)}`,
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Foto konnte nicht geladen werden.')
      }

      const blob = await response.blob()
      const mimeType = blob.type || 'image/jpeg'
      const extension = getPhotoExtension(mimeType)
      const fileName = existingCard.photo_path.split('/').pop() || `profilfoto.${extension}`
      const sourceFile = new File([blob], fileName, {
        type: mimeType,
        lastModified: Date.now(),
      })

      const validationError = validateSourcePhoto(sourceFile)
      if (validationError) {
        throw new Error(validationError)
      }

      setPhotoMasterFile(sourceFile)
      setPhotoSourceFile(sourceFile)
      setPhotoSourceUrl(URL.createObjectURL(sourceFile))
      setCropOpen(true)
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Foto konnte nicht geladen werden.')
    } finally {
      setPhotoLoading(false)
    }
  }

  /** Cancels cropping and discards the temporary source image. */
  function handleCropCancel() {
    setCropOpen(false)
    setPhotoSourceFile(null)
    setPhotoSourceUrl(null)
  }

  /** Applies the selected crop and stores the optimized file for upload. */
  async function handleCropConfirm(cropAreaPixels: Area) {
    if (!photoSourceFile || !photoSourceUrl) return

    setPhotoProcessing(true)
    setPhotoError(null)

    try {
      const optimizedFile = await createOptimizedPhotoFile({
        file: photoSourceFile,
        imageSrc: photoSourceUrl,
        cropAreaPixels,
      })

      const validationError = validatePhoto(optimizedFile)
      if (validationError) {
        throw new Error(validationError)
      }

      if (!photoMasterFile) {
        setPhotoMasterFile(photoSourceFile)
      }
      setPhotoFile(optimizedFile)
      setPhotoPreview(URL.createObjectURL(optimizedFile))
      setCropOpen(false)
      setPhotoSourceFile(null)
      setPhotoSourceUrl(null)
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : 'Das Bild konnte nicht verarbeitet werden.',
      )
    } finally {
      setPhotoProcessing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMsg(null)

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('Vor- und Nachname sind Pflichtfelder.')
      setSaving(false)
      return
    }

    if (!isValidSlug(form.slug)) {
      setError('Der URL-Slug ist ungültig. Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.')
      setSaving(false)
      return
    }

    try {
      let photoPath = existingCard?.photo_path ?? null

      if (photoFile) {
        const formData = new FormData()
        formData.append('file', photoFile)
        if (photoMasterFile) {
          formData.append('source_file', photoMasterFile)
        }
        formData.append('slug', form.slug)

        const uploadRes = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const data = await uploadRes.json()
          throw new Error(data.error || 'Foto-Upload fehlgeschlagen.')
        }

        const uploadData = await uploadRes.json()
        photoPath = uploadData.path
      }

      /** Ensures a URL has https:// prepended if no protocol is present */
      function normalizeUrl(val: string): string | null {
        const trimmed = val.trim()
        if (!trimmed) return null
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
      }

      const cardData = {
        slug: form.slug,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        title: form.title.trim() || null,
        organization: form.organization.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        mobile: form.mobile.trim() || null,
        street: form.street.trim() || null,
        city: form.city.trim() || null,
        zip: form.zip.trim() || null,
        country: form.country.trim() || null,
        website: normalizeUrl(form.website),
        linkedin: normalizeUrl(form.linkedin),
        xing: normalizeUrl(form.xing),
        photo_path: photoPath,
        is_published: form.is_published,
      }

      if (isEditing) {
        const res = await fetch('/api/cards', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: existingCard.id, ...cardData }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Aktualisierung fehlgeschlagen.')
        }

        setSuccessMsg('Visitenkarte erfolgreich aktualisiert!')
      } else {
        const res = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardData),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Erstellung fehlgeschlagen.')
        }

        setSuccessMsg('Visitenkarte erfolgreich erstellt!')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.')
    } finally {
      setSaving(false)
    }
  }

  const initials =
    form.first_name && form.last_name
      ? `${form.first_name.charAt(0)}${form.last_name.charAt(0)}`.toUpperCase()
      : '?'

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Photo Upload */}
      <div className={styles.photoSection}>
        <div className={styles.avatar}>
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Vorschau" className={styles.avatarImg} />
          ) : (
            <span className={styles.avatarInitials}>{initials}</span>
          )}
        </div>
        <div>
          <div className={styles.photoActions}>
            <label htmlFor="photo" className="btn btn--secondary" style={{ cursor: 'pointer' }}>
              Foto auswählen
            </label>
            {photoPreview && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handlePhotoEdit}
                disabled={photoProcessing || photoLoading}
              >
                Foto bearbeiten
              </button>
            )}
          </div>
          <input
            id="photo"
            type="file"
            accept={ACCEPTED_PHOTO_TYPES.join(',')}
            onChange={handlePhotoChange}
            className="sr-only"
          />
          <p className={styles.photoHint}>JPEG, PNG oder WebP</p>
          {photoLoading && <p className={styles.photoStatus}>Foto wird geladen...</p>}
          {photoProcessing && <p className={styles.photoStatus}>Foto wird optimiert...</p>}
          {photoError && <p className="form-field__error">{photoError}</p>}
        </div>
      </div>

      {/* Personal Info */}
      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Persönliche Daten</legend>
        <div className={styles.row}>
          <div className="form-field">
            <label htmlFor="first_name" className="form-field__label">
              Vorname <span className="form-field__required">*</span>
            </label>
            <input
              id="first_name" name="first_name" type="text"
              value={form.first_name} onChange={handleChange}
              className="form-field__input" placeholder="Max" required
            />
          </div>
          <div className="form-field">
            <label htmlFor="last_name" className="form-field__label">
              Nachname <span className="form-field__required">*</span>
            </label>
            <input
              id="last_name" name="last_name" type="text"
              value={form.last_name} onChange={handleChange}
              className="form-field__input" placeholder="Mustermann" required
            />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="title" className="form-field__label">Position / Titel</label>
          <input
            id="title" name="title" type="text"
            value={form.title} onChange={handleChange}
            className="form-field__input" placeholder="z.B. Referent Öffentlichkeitsarbeit"
          />
        </div>
        <div className="form-field">
          <label htmlFor="organization" className="form-field__label">Organisation</label>
          <input
            id="organization" name="organization" type="text"
            value={form.organization} onChange={handleChange}
            className="form-field__input" placeholder="Deutsches Rotes Kreuz"
          />
        </div>
      </fieldset>

      {/* Contact */}
      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Kontakt</legend>
        <div className="form-field">
          <label htmlFor="email" className="form-field__label">E-Mail</label>
          <input
            id="email" name="email" type="email"
            value={form.email} onChange={handleChange}
            className="form-field__input" placeholder="max.mustermann@drk.de"
          />
        </div>
        <div className={styles.row}>
          <div className="form-field">
            <label htmlFor="phone" className="form-field__label">Telefon</label>
            <input
              id="phone" name="phone" type="tel"
              value={form.phone} onChange={handleChange}
              className="form-field__input" placeholder="+49 30 12345678"
            />
          </div>
          <div className="form-field">
            <label htmlFor="mobile" className="form-field__label">Mobil</label>
            <input
              id="mobile" name="mobile" type="tel"
              value={form.mobile} onChange={handleChange}
              className="form-field__input" placeholder="+49 170 1234567"
            />
          </div>
        </div>
      </fieldset>

      {/* Address */}
      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Adresse</legend>
        <div className="form-field">
          <label htmlFor="street" className="form-field__label">Straße</label>
          <input
            id="street" name="street" type="text"
            value={form.street} onChange={handleChange}
            className="form-field__input" placeholder="Carstennstraße 58"
          />
        </div>
        <div className={styles.row}>
          <div className="form-field">
            <label htmlFor="zip" className="form-field__label">PLZ</label>
            <input
              id="zip" name="zip" type="text"
              value={form.zip} onChange={handleChange}
              className="form-field__input" placeholder="12205"
            />
          </div>
          <div className="form-field">
            <label htmlFor="city" className="form-field__label">Stadt</label>
            <input
              id="city" name="city" type="text"
              value={form.city} onChange={handleChange}
              className="form-field__input" placeholder="Berlin"
            />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="country" className="form-field__label">Land</label>
          <input
            id="country" name="country" type="text"
            value={form.country} onChange={handleChange}
            className="form-field__input" placeholder="Deutschland"
          />
        </div>
      </fieldset>

      {/* Online Profiles */}
      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Online-Profile</legend>
        <div className="form-field">
          <label htmlFor="website" className="form-field__label">Webseite</label>
          <input
            id="website" name="website" type="text"
            value={form.website} onChange={handleChange}
            className="form-field__input" placeholder="www.drk.de"
          />
          <p className={styles.fieldHint}>z.B. www.drk.de oder https://drk.de</p>
        </div>
        <div className={styles.row}>
          <div className="form-field">
            <label htmlFor="linkedin" className="form-field__label">LinkedIn</label>
            <input
              id="linkedin" name="linkedin" type="text"
              value={form.linkedin} onChange={handleChange}
              className="form-field__input" placeholder="linkedin.com/in/..."
            />
          </div>
          <div className="form-field">
            <label htmlFor="xing" className="form-field__label">Xing</label>
            <input
              id="xing" name="xing" type="text"
              value={form.xing} onChange={handleChange}
              className="form-field__input" placeholder="xing.com/profile/..."
            />
          </div>
        </div>
      </fieldset>

      {/* Slug + Publishing */}
      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Veröffentlichung</legend>
        <div className="form-field">
          <label htmlFor="slug" className="form-field__label">
            URL-Slug <span className="form-field__required">*</span>
          </label>
          <input
            id="slug" name="slug" type="text"
            value={form.slug} onChange={handleChange}
            className={`form-field__input ${slugAvailable === false ? 'form-field__input--error' : ''}`}
            placeholder="max-mustermann"
          />
          {form.slug && (
            <p className={styles.slugPreview}>
              Ihre Karte: <code>{siteUrl}/c/{form.slug}</code>
              {slugAvailable === true && <span className={styles.slugOk}> ✓ verfügbar</span>}
              {slugAvailable === false && <span className={styles.slugTaken}> ✗ vergeben</span>}
            </p>
          )}
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox" name="is_published"
            checked={form.is_published} onChange={handleChange}
          />
          <span className={styles.toggleLabel}>
            Visitenkarte veröffentlichen
          </span>
          <span className={styles.toggleHint}>
            {form.is_published
              ? 'Ihre Karte ist öffentlich sichtbar.'
              : 'Ihre Karte ist nur als Entwurf gespeichert.'}
          </span>
        </label>
        {form.is_published && (
          <p className={styles.publishNotice}>
            Mit der Veröffentlichung werden Ihre eingegebenen Kontaktdaten (Name, Position,
            Kontaktdaten, Adresse, Online-Profile und ggf. Foto) über eine öffentliche URL
            für jeden abrufbar. Sie können die Veröffentlichung jederzeit rückgängig machen.
            Mehr dazu in unserer{' '}
            <a href="/datenschutz" target="_blank" rel="noopener noreferrer">
              Datenschutzerklärung
            </a>.
          </p>
        )}
      </fieldset>

      {error && <p className={styles.errorMsg}>{error}</p>}
      {successMsg && <p className={styles.successMsg}>{successMsg}</p>}

      <button
        type="submit"
        className="btn btn--primary btn--full"
        disabled={saving || photoLoading || photoProcessing || slugAvailable === false}
      >
        {saving
          ? 'Wird gespeichert...'
          : isEditing
            ? 'Änderungen speichern'
            : 'Visitenkarte erstellen'}
      </button>

      <PhotoCropDialog
        open={cropOpen}
        imageSrc={photoSourceUrl}
        processing={photoProcessing}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
      />
    </form>
  )
}
