import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'
import { getPhotoUrl } from '@/lib/photo'
import type { CardRow } from '@/lib/types'

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
  const photoUrl = getPhotoUrl(card.photo_path)

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
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
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
    },
  )
}
