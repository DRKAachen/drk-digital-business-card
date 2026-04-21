import Link from 'next/link'
import SupportButton from '@/components/support/SupportButton'

export const metadata = { title: 'Impressum' }

/**
 * Legal notice page (Impressum). Required by German law (TMG §5).
 * Contains all legally mandated organizational and contact information.
 */
export default function ImpressumPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem', maxWidth: 640 }}>
      <Link href="/" style={{ color: '#e30613', fontSize: '0.875rem' }}>← Zurück</Link>
      <h1 style={{ fontSize: '1.875rem', marginTop: '1rem', marginBottom: '1.5rem' }}>Impressum</h1>
      <div style={{ color: '#525252', lineHeight: 1.8, fontSize: '0.9375rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#171717' }}>
          Angaben gemäß § 5 TMG
        </h2>
        <p>
          DRK-Kreisverband Städteregion Aachen e.V.<br />
          Henry-Dunant-Platz 1<br />
          52146 Würselen
        </p>

        <h2 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#171717' }}>
          Vertreten durch
        </h2>
        <p>Axel Fielen, Vorsitzender des Vorstands</p>

        <h2 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#171717' }}>
          Kontakt
        </h2>
        <p>
          Telefon: +49 2405 6039100<br />
          E-Mail: <a href="mailto:Info@DRK-Aachen.de" style={{ color: '#e30613' }}>Info@DRK-Aachen.de</a><br />
          Web: <a href="https://www.drk-aachen.de" target="_blank" rel="noopener noreferrer" style={{ color: '#e30613' }}>www.drk-aachen.de</a>
        </p>

        <h2 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#171717' }}>
          Registereintrag
        </h2>
        <p>
          Registergericht: Amtsgericht Aachen<br />
          Registernummer: VR 4535
        </p>

        <h2 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#171717' }}>
          Umsatzsteuer-ID
        </h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
          DE121729631
        </p>

        <h2 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#171717' }}>
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
        </h2>
        <p>
          Axel Fielen<br />
          DRK-Kreisverband Städteregion Aachen e.V.<br />
          Henry-Dunant-Platz 1<br />
          52146 Würselen
        </p>

        <h2 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#171717' }}>
          Haftungsausschluss
        </h2>
        <p>
          Die Inhalte dieser Anwendung wurden mit größtmöglicher Sorgfalt erstellt.
          Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen
          wir jedoch keine Gewähr. Die Nutzung der Inhalte erfolgt auf eigene Gefahr.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Diese Anwendung enthält Links zu externen Webseiten Dritter, auf deren Inhalte
          wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der
          jeweilige Anbieter oder Betreiber verantwortlich. Bei Bekanntwerden von
          Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>
      </div>

      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e5e5', display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#e30613', alignItems: 'center' }}>
        <Link href="/impressum" style={{ color: '#e30613' }}>Impressum</Link>
        <Link href="/datenschutz" style={{ color: '#e30613' }}>Datenschutz</Link>
        <SupportButton variant="link" />
      </footer>
    </div>
  )
}
