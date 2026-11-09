import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'
import { getPhotoUrl } from '@/lib/photo'
import { fetchPhotoAsPngDataUri } from '@/lib/image-convert'
import type { CardRow } from '@/lib/types'

/**
 * Kantenlänge des eingebetteten Fotos. Der Avatar wird mit 220px dargestellt;
 * doppelte Auflösung, damit er auf hochauflösenden Anzeigen scharf bleibt.
 */
const PHOTO_SIZE = 440

/**
 * Dynamically generates an Open Graph image (1200x630) for a card.
 * Shows the card header with photo/initials, name, title, and organization
 * in a branded layout. Used by WhatsApp, LinkedIn, Twitter, etc.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const card: CardRow | null = await prisma.card.findFirst({
    where: { slug, is_published: true },
  })

  if (!card) {
    return new Response('Not found', { status: 404 })
  }

  const fullName = `${card.first_name} ${card.last_name}`
  const initials = `${card.first_name.charAt(0)}${card.last_name.charAt(0)}`.toUpperCase()
  /*
   * Foto serverseitig nach PNG wandeln und einbetten, statt Satori die URL zu
   * geben: Fotos liegen als WebP im Objektspeicher, und Satori lädt in <img>
   * nur PNG, JPEG und SVG. Mit der URL blieb der Avatar-Kreis still leer.
   * Schlägt die Konvertierung fehl, greift unten der Initialen-Fallback.
   */
  const photoUrl = getPhotoUrl(card.photo_path)
  const photoData = photoUrl ? await fetchPhotoAsPngDataUri(photoUrl, PHOTO_SIZE) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #002d55 0%, #001e3a 100%)',
          padding: '60px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
        }}
      >
        {/* Left: card info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingRight: '40px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              opacity: 0.6,
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}
          >
            Digitale Visitenkarte
          </div>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            {fullName}
          </div>
          {card.title && (
            <div
              style={{
                fontSize: '24px',
                opacity: 0.9,
                marginBottom: '8px',
              }}
            >
              {card.title}
            </div>
          )}
          {card.organization && (
            <div
              style={{
                fontSize: '22px',
                opacity: 0.7,
              }}
            >
              {card.organization}
            </div>
          )}
        </div>

        {/* Right: avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {photoData ? (
            <img
              src={photoData}
              alt=""
              width={220}
              height={220}
              style={{
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid rgba(255,255,255,0.3)',
              }}
            />
          ) : (
            <div
              style={{
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '4px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '72px',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              {initials}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        /*
         * Jeder Abruf lädt und konvertiert das Foto. Social-Media-Crawler
         * fragen dieselbe Karte beim Teilen mehrfach ab, deshalb eine Stunde
         * cachen und bis zu einen Tag veraltet ausliefern, während im
         * Hintergrund neu erzeugt wird. Ändert jemand sein Foto, greift die
         * Vorschau spätestens nach einer Stunde — Messenger halten ihre
         * eigenen Kopien ohnehin deutlich länger.
         */
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    },
  )
}
