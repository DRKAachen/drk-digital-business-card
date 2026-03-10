export const metadata = { title: 'Datenschutzerklärung' }

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || 'Deutsches Rotes Kreuz'

/**
 * Privacy policy page (Datenschutzerklärung). Required by GDPR Art. 13/14.
 * Content should be customized per DRK organization.
 * Uses the design system's .legal-content class for consistent typography.
 */
export default function DatenschutzPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 className="page__title">Datenschutzerklärung</h1>
      <div className="legal-content">
        <h2>1. Verantwortlicher</h2>
        <p>{orgName} – [vollständige Kontaktdaten einfügen]</p>

        <h2>2. Art und Zweck der Datenverarbeitung</h2>
        <p>
          Diese Anwendung ermöglicht es Mitarbeitenden, eine digitale Visitenkarte zu erstellen und als QR-Code zu teilen.
          Dabei werden folgende personenbezogene Daten verarbeitet: Name, Position, Kontaktdaten (E-Mail, Telefon),
          Adresse, Online-Profile (LinkedIn, Xing) sowie optional ein Profilfoto.
        </p>

        <h2>3. Rechtsgrundlage</h2>
        <p>
          Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.
          Sie erstellen Ihre Visitenkarte freiwillig und können diese jederzeit löschen.
        </p>

        <h2>4. Datenspeicherung</h2>
        <p>
          Die Daten werden bei Supabase (AWS-Infrastruktur, Region EU Frankfurt, eu-central-1) gespeichert.
          Supabase verfügt über eine Auftragsverarbeitungsvereinbarung (AVV/DPA) gemäß Art. 28 DSGVO.
        </p>

        <h2>5. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Datenübertragbarkeit Ihrer Daten.
          Zur Ausübung Ihrer Rechte können Sie sich jederzeit an uns wenden oder Ihre Daten direkt
          über die Anwendung bearbeiten bzw. löschen.
        </p>

        <h2>6. Cookies</h2>
        <p>
          Diese Anwendung verwendet ausschließlich technisch notwendige Cookies für die Authentifizierung (Session-Cookie).
          Es werden keine Tracking- oder Analyse-Cookies verwendet.
        </p>

        <h2>7. Öffentliche Visitenkarten</h2>
        <p>
          Wenn Sie Ihre Visitenkarte veröffentlichen, sind die darin enthaltenen Kontaktdaten über die
          öffentliche URL abrufbar. Die öffentliche Kartenseite setzt keine Cookies und führt kein Tracking durch.
        </p>
      </div>
    </div>
  )
}
