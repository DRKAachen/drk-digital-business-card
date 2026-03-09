import Link from 'next/link'

export const metadata = { title: 'Impressum' }

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || 'Deutsches Rotes Kreuz'

/**
 * Legal notice page (Impressum). Required by German law (TMG §5).
 * Content should be customized per DRK organization.
 */
export default function ImpressumPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem', maxWidth: 640 }}>
      <Link href="/" style={{ color: '#e30613', fontSize: '0.875rem' }}>← Zurück</Link>
      <h1 style={{ fontSize: '1.875rem', marginTop: '1rem', marginBottom: '1.5rem' }}>Impressum</h1>
      <p style={{ color: '#525252', lineHeight: 1.8 }}>
        {orgName}<br />
        [Adresse einfügen]<br />
        [PLZ Ort]<br /><br />
        <strong>Kontakt:</strong><br />
        Telefon: [Telefonnummer]<br />
        E-Mail: [E-Mail-Adresse]<br /><br />
        <strong>Vertreten durch:</strong><br />
        [Name des Vertretungsberechtigten]<br /><br />
        <strong>Registereintrag:</strong><br />
        Registergericht: [Gericht]<br />
        Registernummer: [Nummer]<br /><br />
        <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
        [Name, Adresse]
      </p>
    </div>
  )
}
