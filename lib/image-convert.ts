import 'server-only'
import sharp from 'sharp'

/**
 * Serverseitige Bildkonvertierung für Ausgabekanäle, die kein WebP können.
 *
 * Kartenfotos werden beim Zuschneiden bevorzugt als WebP gespeichert (siehe
 * OUTPUT_TYPES in lib/photo-client.ts) — für die Kartenseite genau richtig.
 * Zwei Abnehmer kommen damit aber nicht zurecht:
 *
 *   - Open-Graph-Bilder: `ImageResponse` rendert über Satori, das in <img>
 *     nur PNG, JPEG und SVG lädt. Ein WebP scheitert still, und übrig bleibt
 *     ein leerer Avatar-Kreis in der Social-Media-Vorschau.
 *   - Apple-Wallet-Pässe: Apple akzeptiert in .pkpass-Dateien ausschließlich PNG.
 *
 * Beide brauchen dasselbe: Foto laden, nach PNG wandeln, auf Zielgröße bringen.
 * Deshalb liegt das hier einmal und nicht zweimal verstreut.
 */

/** Abbruch, falls der Objektspeicher hängt — ein OG-Bild darf nicht ewig blockieren. */
const FETCH_TIMEOUT_MS = 5000

/**
 * Obergrenze für das geladene Original. Uploads sind bereits auf 2 MB begrenzt
 * (MAX_PHOTO_SIZE); die Reserve fängt nur ab, falls im Bucket etwas Größeres liegt.
 */
const MAX_BYTES = 5 * 1024 * 1024

/**
 * Lädt ein gespeichertes Kartenfoto und gibt es als quadratisches PNG zurück.
 *
 * Wirft nie: Jeder Fehler (Netz, Zeitüberschreitung, defekte Datei, zu groß)
 * ergibt `null`, damit die Aufrufer auf ihre eigene Darstellung zurückfallen
 * können — beim OG-Bild sind das die Initialen. Ein fehlendes Foto darf die
 * Vorschau nicht komplett verhindern.
 *
 * @param url  Öffentliche URL des Fotos (aus getPhotoUrl()).
 * @param size Kantenlänge des Ergebnisses in Pixeln.
 */
export async function fetchPhotoAsPng(url: string, size: number): Promise<Buffer | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) {
      console.error('[image-convert] Foto nicht abrufbar:', res.status, url)
      return null
    }

    const length = Number(res.headers.get('content-length') ?? 0)
    if (length > MAX_BYTES) {
      console.error('[image-convert] Foto zu groß:', length, url)
      return null
    }

    const input = Buffer.from(await res.arrayBuffer())
    if (input.byteLength > MAX_BYTES) {
      console.error('[image-convert] Foto zu groß (nach Download):', input.byteLength, url)
      return null
    }

    // Fotos sind beim Upload bereits quadratisch zugeschnitten; `cover` ist nur
    // die Absicherung für Altbestände mit abweichendem Seitenverhältnis.
    return await sharp(input).resize(size, size, { fit: 'cover' }).png().toBuffer()
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error('[image-convert] Zeitüberschreitung nach', FETCH_TIMEOUT_MS, 'ms:', url)
    } else {
      console.error('[image-convert] Konvertierung fehlgeschlagen:', err)
    }
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Wie {@link fetchPhotoAsPng}, liefert das Ergebnis aber als Data-URI.
 *
 * Satori kann externe Bilder zwar selbst laden, scheitert dabei aber an WebP.
 * Indem wir das fertige PNG direkt einbetten, lädt Satori gar nichts mehr nach
 * und das Format ist garantiert eines, das es versteht.
 */
export async function fetchPhotoAsPngDataUri(url: string, size: number): Promise<string | null> {
  const png = await fetchPhotoAsPng(url, size)
  return png ? `data:image/png;base64,${png.toString('base64')}` : null
}
