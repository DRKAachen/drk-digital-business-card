export const metadata = { title: 'Impressum' }

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || 'Deutsches Rotes Kreuz'

/**
 * Legal notice page (Impressum). Required by German law (TMG §5).
 * Content should be customized per DRK organization.
 * Uses the design system's .legal-content class for consistent typography.
 */
export default function ImpressumPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 className="page__title">Impressum</h1>
      <div className="legal-content">
        <p>
          {orgName}<br />
          [Adresse einfügen]<br />
          [PLZ Ort]
        </p>

        <h2>Kontakt</h2>
        <p>
          Telefon: [Telefonnummer]<br />
          E-Mail: [E-Mail-Adresse]
        </p>

        <h2>Vertreten durch</h2>
        <p>[Name des Vertretungsberechtigten]</p>

        <h2>Registereintrag</h2>
        <p>
          Registergericht: [Gericht]<br />
          Registernummer: [Nummer]
        </p>

        <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p>[Name, Adresse]</p>
      </div>
    </div>
  )
}
