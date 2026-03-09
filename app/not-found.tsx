import Link from 'next/link'

/**
 * Custom 404 page shown when a route or card slug is not found.
 */
export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '1rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
        Seite nicht gefunden
      </h2>
      <p style={{ color: '#737373', marginBottom: '2rem', maxWidth: 400 }}>
        Die gesuchte Seite oder Visitenkarte existiert nicht oder wurde entfernt.
      </p>
      <Link href="/" className="btn btn--primary">
        Zur Startseite
      </Link>
    </div>
  )
}
