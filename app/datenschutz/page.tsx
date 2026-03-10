import Link from 'next/link'

export const metadata = { title: 'Datenschutzerklärung' }

/**
 * Privacy policy page (Datenschutzerklärung). Required by GDPR Art. 13/14.
 * Covers all data processing activities of the digital business card application.
 */
export default function DatenschutzPage() {
  const h2Style = { fontSize: '1.25rem', marginTop: '2rem', marginBottom: '0.5rem', color: '#171717' } as const

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem', maxWidth: 640 }}>
      <Link href="/" style={{ color: '#e30613', fontSize: '0.875rem' }}>← Zurück</Link>
      <h1 style={{ fontSize: '1.875rem', marginTop: '1rem', marginBottom: '1.5rem' }}>Datenschutzerklärung</h1>
      <div style={{ color: '#525252', lineHeight: 1.8, fontSize: '0.9375rem' }}>

        {/* --- 1. Verantwortlicher --- */}
        <h2 style={h2Style}>1. Verantwortlicher</h2>
        <p>
          DRK-Kreisverband Städteregion Aachen e.V.<br />
          Henry-Dunant-Platz 1<br />
          52146 Würselen<br /><br />
          Telefon: +49 2405 6039100<br />
          E-Mail: <a href="mailto:Info@DRK-Aachen.de" style={{ color: '#e30613' }}>Info@DRK-Aachen.de</a><br />
          Web: <a href="https://www.drk-aachen.de" target="_blank" rel="noopener noreferrer" style={{ color: '#e30613' }}>www.drk-aachen.de</a>
        </p>

        {/* --- 2. Datenschutzbeauftragter --- */}
        <h2 style={h2Style}>2. Datenschutzbeauftragter</h2>
        <p>
          Stefan Ulbrich<br />
          Henry-Dunant-Platz 1<br />
          52146 Würselen<br /><br />
          Telefon: +49 2405 6039445<br />
          E-Mail: <a href="mailto:datenschutz@drk-aachen.de" style={{ color: '#e30613' }}>datenschutz@drk-aachen.de</a>
        </p>

        {/* --- 3. Art und Zweck der Datenverarbeitung --- */}
        <h2 style={h2Style}>3. Art und Zweck der Datenverarbeitung</h2>
        <p>
          Diese Anwendung ermöglicht es Mitarbeitenden des DRK-Kreisverbands Städteregion Aachen e.V.,
          eine digitale Visitenkarte zu erstellen und als QR-Code zu teilen.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Dabei werden folgende personenbezogene Daten verarbeitet:
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          <li><strong>Authentifizierung:</strong> E-Mail-Adresse und ggf. Passwort (für Login per Passwort oder Magic Link)</li>
          <li><strong>Visitenkarte:</strong> Vorname, Nachname, Position/Titel, Organisation, E-Mail, Telefon,
            Mobilnummer, Adresse (Straße, PLZ, Stadt, Land), Webseite, LinkedIn-Profil, Xing-Profil</li>
          <li><strong>Profilfoto:</strong> Optional hochgeladenes Bild (JPEG, PNG oder WebP, max. 2 MB)</li>
          <li><strong>Technische Daten:</strong> IP-Adresse, Browsertyp, Zugriffszeitpunkt (Server-Logfiles)</li>
        </ul>

        {/* --- 4. Rechtsgrundlagen --- */}
        <h2 style={h2Style}>4. Rechtsgrundlagen</h2>
        <p>
          <strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):</strong> Sie erstellen Ihre Visitenkarte
          freiwillig und entscheiden selbst, welche Daten Sie eingeben und ob Sie die Karte veröffentlichen.
          Die Einwilligung kann jederzeit durch Löschen der Karte oder des Kontos widerrufen werden.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          <strong>Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO):</strong> Die vorübergehende
          Speicherung der IP-Adresse und technischer Daten in Server-Logfiles ist für den Betrieb
          und die Sicherheit der Anwendung erforderlich.
        </p>

        {/* --- 5. Datenspeicherung & Auftragsverarbeiter --- */}
        <h2 style={h2Style}>5. Datenspeicherung und Auftragsverarbeiter</h2>

        <h3 style={{ fontSize: '1.05rem', marginTop: '1.25rem', marginBottom: '0.25rem', color: '#171717' }}>
          5.1 Supabase (Datenbank, Authentifizierung, Dateispeicher)
        </h3>
        <p>
          Alle Visitenkarten-Daten, Benutzerkonten und hochgeladene Fotos werden bei
          Supabase Inc. gespeichert. Die Datenbank und der Dateispeicher befinden sich auf
          AWS-Infrastruktur in der Region EU Frankfurt (eu-central-1). Mit Supabase besteht
          eine Auftragsverarbeitungsvereinbarung (AVV/DPA) gemäß Art. 28 DSGVO.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Supabase versendet zudem die Magic-Link-Anmelde-E-Mails. Dabei wird Ihre
          E-Mail-Adresse verarbeitet.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Weitere Informationen:{' '}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e30613' }}>
            supabase.com/privacy
          </a>
        </p>

        <h3 style={{ fontSize: '1.05rem', marginTop: '1.25rem', marginBottom: '0.25rem', color: '#171717' }}>
          5.2 Vercel (Hosting)
        </h3>
        <p>
          Diese Anwendung wird auf der Plattform Vercel Inc. gehostet. Die serverseitigen
          Funktionen laufen in der EU-Region Frankfurt. Vercel verarbeitet dabei technische
          Daten (IP-Adresse, HTTP-Header) zur Auslieferung der Webseite. Das globale
          Content-Delivery-Network (CDN) von Vercel kann statische Inhalte auch über
          Server außerhalb der EU ausliefern.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Mit Vercel besteht eine Auftragsverarbeitungsvereinbarung (DPA) inkl.
          EU-Standardvertragsklauseln (SCCs) für internationale Datenübermittlungen.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Weitere Informationen:{' '}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#e30613' }}>
            vercel.com/legal/privacy-policy
          </a>
        </p>

        {/* --- 6. Cookies --- */}
        <h2 style={h2Style}>6. Cookies</h2>
        <p>
          Diese Anwendung verwendet ausschließlich technisch notwendige Cookies für die
          Authentifizierung (Supabase-Session-Cookie). Diese Cookies sind für den Betrieb
          der Anwendung erforderlich und werden nach Ende der Sitzung oder bei Abmeldung gelöscht.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Es werden <strong>keine</strong> Tracking-, Analyse- oder Marketing-Cookies verwendet.
          Ein Cookie-Consent-Banner ist daher nicht erforderlich (§ 25 Abs. 2 TDDDG – Ausnahme
          für technisch notwendige Cookies).
        </p>

        {/* --- 7. Externe Links --- */}
        <h2 style={h2Style}>7. Externe Links (Google Maps)</h2>
        <p>
          Veröffentlichte Visitenkarten können einen &bdquo;Route&ldquo;-Link enthalten, der auf
          Google Maps (google.com/maps) verweist. Beim Klick auf diesen Link verlassen
          Sie unsere Anwendung. Es werden dabei keine Daten von uns an Google übermittelt.
          Erst beim Aufruf der Google-Maps-Seite gelten die Datenschutzbestimmungen von Google.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Weitere Informationen:{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e30613' }}>
            policies.google.com/privacy
          </a>
        </p>

        {/* --- 8. Öffentliche Visitenkarten --- */}
        <h2 style={h2Style}>8. Öffentliche Visitenkarten</h2>
        <p>
          Wenn Sie Ihre Visitenkarte veröffentlichen, sind die darin enthaltenen Kontaktdaten
          über eine öffentliche URL abrufbar. Dazu gehören: Name, Position, Organisation,
          Kontaktdaten, Adresse, Online-Profile und ggf. das Profilfoto.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Beim Teilen der Karten-URL in sozialen Netzwerken oder Messengern können
          Name und Profilfoto als Vorschau (Open-Graph-Metadaten) angezeigt werden.
          Die öffentliche Kartenseite selbst setzt keine Cookies und führt kein Tracking durch.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Besucher können über einen Button die Kontaktdaten als vCard-Datei (.vcf) herunterladen
          und direkt in ihr Adressbuch importieren. Diese vCard wird serverseitig aus den
          gespeicherten Kartendaten generiert.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Sie können die Veröffentlichung jederzeit über Ihr Dashboard rückgängig machen.
          Die Karte ist dann nicht mehr öffentlich abrufbar.
        </p>

        {/* --- 9. Datenspeicherung und Löschung --- */}
        <h2 style={h2Style}>9. Speicherdauer und Löschung</h2>
        <p>
          Ihre Visitenkarten-Daten werden gespeichert, solange Ihr Benutzerkonto besteht.
          Sie können Ihre Visitenkarte jederzeit über das Dashboard bearbeiten oder löschen.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Über die Kontoeinstellungen im Dashboard können Sie:
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          <li>Alle Ihre Daten als JSON-Datei herunterladen (Datenexport)</li>
          <li>Ihr gesamtes Konto samt Visitenkarte und Profilfoto unwiderruflich löschen</li>
        </ul>
        <p style={{ marginTop: '0.75rem' }}>
          Bei Löschung Ihres Kontos werden alle zugehörigen Daten (Visitenkarte, Profilfoto,
          Benutzerkonto) sofort und unwiderruflich entfernt.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Server-Logfiles (IP-Adresse, Zugriffsdaten) werden automatisch nach spätestens
          30 Tagen gelöscht.
        </p>

        {/* --- 10. Ihre Rechte --- */}
        <h2 style={h2Style}>10. Ihre Rechte</h2>
        <p>
          Nach der DSGVO stehen Ihnen folgende Rechte zu:
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre bei uns gespeicherten Daten verlangen.</li>
          <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Sie können die Berichtigung unrichtiger Daten verlangen oder diese selbst im Dashboard korrigieren.</li>
          <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer Daten verlangen oder Ihr gesamtes Konto direkt über die Kontoeinstellungen im Dashboard löschen.</li>
          <li><strong>Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sie können die Einschränkung der Verarbeitung Ihrer Daten verlangen.</li>
          <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie können Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format (JSON) über die Kontoeinstellungen herunterladen. Zusätzlich steht eine vCard-Exportfunktion zur Verfügung.</li>
          <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie können der Verarbeitung Ihrer Daten widersprechen, soweit diese auf berechtigtem Interesse basiert.</li>
          <li><strong>Widerrufsrecht:</strong> Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen.</li>
        </ul>
        <p style={{ marginTop: '0.75rem' }}>
          Zur Ausübung Ihrer Rechte wenden Sie sich bitte an unseren Datenschutzbeauftragten
          unter <a href="mailto:datenschutz@drk-aachen.de" style={{ color: '#e30613' }}>datenschutz@drk-aachen.de</a>.
        </p>

        {/* --- 11. Beschwerderecht --- */}
        <h2 style={h2Style}>11. Beschwerderecht bei einer Aufsichtsbehörde</h2>
        <p>
          Unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfs
          haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren
          (Art. 77 DSGVO). Die für uns zuständige Aufsichtsbehörde ist:
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen<br />
          Postfach 20 04 44, 40102 Düsseldorf<br />
          Telefon: +49 211 38424-0<br />
          E-Mail: <a href="mailto:poststelle@ldi.nrw.de" style={{ color: '#e30613' }}>poststelle@ldi.nrw.de</a><br />
          Web: <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" style={{ color: '#e30613' }}>www.ldi.nrw.de</a>
        </p>

        {/* --- 12. Keine automatisierte Entscheidungsfindung --- */}
        <h2 style={h2Style}>12. Automatisierte Entscheidungsfindung</h2>
        <p>
          Es findet keine automatisierte Entscheidungsfindung oder Profiling im Sinne
          von Art. 22 DSGVO statt.
        </p>

        {/* --- 13. Änderungen --- */}
        <h2 style={h2Style}>13. Änderungen dieser Datenschutzerklärung</h2>
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung bei Änderungen an der Anwendung
          oder bei neuen rechtlichen Anforderungen anzupassen. Die aktuelle Version ist stets
          unter <code>/datenschutz</code> abrufbar.
        </p>
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#737373' }}>
          Stand: März 2026
        </p>
      </div>

      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e5e5', display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
        <Link href="/impressum" style={{ color: '#e30613' }}>Impressum</Link>
        <Link href="/datenschutz" style={{ color: '#e30613' }}>Datenschutz</Link>
      </footer>
    </div>
  )
}
