# DRK Digitale Visitenkarte

Digitale Visitenkarten-App für das Deutsche Rote Kreuz. Mitarbeitende können ihre eigene Visitenkarte erstellen, als QR-Code teilen und Kontaktdaten per vCard zum Herunterladen anbieten.

## Features

- **Self-Service**: Jede/r Mitarbeitende erstellt und verwaltet die eigene Visitenkarte
- **QR-Code**: Generierung mit DRK-Logo, Download als PNG (Druck) oder SVG (Vektor)
- **Kontakt speichern**: vCard 3.0 Download – ein Klick zum Speichern im Adressbuch
- **Teilen**: Web Share API / Link kopieren
- **Fotos**: Upload von Profilfotos (JPEG, PNG, WebP, max. 2 MB)
- **DSGVO-konform**: Supabase EU-Region (Frankfurt), keine Cookies auf öffentlichen Seiten, kein Tracking
- **Magic-Link-Login**: Passwortlose Anmeldung per E-Mail
- **Open Graph**: Rich-Link-Previews beim Teilen auf Social Media

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, SCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **QR-Code**: qrcode (Canvas + SVG)
- **Deployment**: Vercel (empfohlen)

## Schnellstart

### Voraussetzungen

- Node.js >= 20
- Ein Supabase-Projekt (EU-Region Frankfurt empfohlen)

### 1. Repository klonen & installieren

```bash
git clone <repo-url>
cd drk-digital-business-card
npm install
```

### 2. Supabase einrichten

1. Neues Projekt auf [supabase.com](https://supabase.com) erstellen (Region: **EU Frankfurt**)
2. SQL-Migration ausführen: Kopieren Sie den Inhalt von `supabase/migrations/001_create_cards.sql` in den Supabase SQL-Editor und führen Sie ihn aus
3. **Authentication** konfigurieren:
   - Unter Authentication > Providers: Email aktivieren (Magic Link)
   - Unter Authentication > URL Configuration: Site-URL und Redirect-URLs setzen

### 3. Umgebungsvariablen

```bash
cp .env.example .env.local
```

Datei `.env.local` ausfüllen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ihr-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ORG_NAME=DRK Kreisverband Aachen e.V.
```

### 4. Starten

```bash
npm run dev
```

App ist unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Deployment (Vercel)

1. Repository mit Vercel verbinden
2. Umgebungsvariablen in Vercel setzen (wie oben)
3. `NEXT_PUBLIC_SITE_URL` auf die Produktions-URL setzen (z.B. `https://visitenkarte.drk-aachen.de`)
4. In Supabase die Produktions-URL als Redirect-URL hinzufügen

## Projektstruktur

```
├── app/                    # Next.js App Router Seiten
│   ├── c/[slug]/           # Öffentliche Visitenkarten-Seite
│   │   └── vcard/          # vCard Download API
│   ├── dashboard/          # Geschützter Bereich
│   │   ├── edit/           # Visitenkarte bearbeiten
│   │   └── qr/             # QR-Code exportieren
│   ├── login/              # Magic-Link Login
│   ├── datenschutz/        # Datenschutzerklärung
│   └── impressum/          # Impressum
├── components/             # React-Komponenten
│   ├── auth/               # Login, Logout
│   ├── card/               # Öffentliche Kartenansicht
│   ├── editor/             # Kartenformular
│   └── qr/                 # QR-Code Generierung & Export
├── lib/                    # Shared Libraries
│   ├── supabase/           # Client, Server, Types
│   ├── vcard.ts            # vCard 3.0 Generator
│   ├── slug.ts             # URL-Slug Generierung
│   └── photo.ts            # Foto-Validierung & URLs
├── styles/                 # Globale SCSS Styles
├── supabase/migrations/    # SQL-Migrationen
├── middleware.ts            # Auth Session Refresh & Route Protection
└── public/                 # Statische Assets
```

## Anpassung für andere DRK-Verbände

1. `NEXT_PUBLIC_ORG_NAME` in `.env.local` anpassen
2. Impressum und Datenschutzerklärung in `app/impressum/page.tsx` und `app/datenschutz/page.tsx` mit eigenen Daten füllen
3. Optional: Logo in `public/drk-logo.svg` und `public/favicon.svg` austauschen
4. Eigenes Supabase-Projekt erstellen und konfigurieren

## Rechtliches

- **Impressum**: Muss vor Produktiveinsatz mit den korrekten Angaben gemäß TMG §5 befüllt werden
- **Datenschutzerklärung**: Muss vor Produktiveinsatz überprüft und ggf. durch einen DSB ergänzt werden
- **Supabase DPA**: Eine Auftragsverarbeitungsvereinbarung (AVV) mit Supabase sollte abgeschlossen werden

## Lizenz

Intern – DRK Kreisverband Aachen e.V.
