# DRK Digitale Visitenkarte

Digitale Visitenkarten-App für das Deutsche Rote Kreuz. Mitarbeitende können ihre eigene Visitenkarte erstellen, als QR-Code teilen und Kontaktdaten per vCard zum Herunterladen anbieten.

## Features

- **Self-Service**: Jede/r Mitarbeitende erstellt und verwaltet die eigene Visitenkarte
- **QR-Code**: Generierung mit DRK-Logo, Download als PNG (Druck) oder SVG (Vektor)
- **Kontakt speichern**: vCard 3.0 Download – ein Klick zum Speichern im Adressbuch
- **Teilen**: Web Share API / Link kopieren
- **Fotos**: Upload von Profilfotos (JPEG, PNG, WebP, max. 2 MB)
- **DSGVO-konform**: EU-Hosting (Frankfurt), keine externen Dienste auf öffentlichen Seiten, kein Tracking, Security Headers
- **Magic-Link-Login**: Passwortlose Anmeldung per E-Mail mit Datenschutzhinweis
- **Open Graph**: Rich-Link-Previews beim Teilen auf Social Media
- **Datenexport**: JSON-Export aller persönlichen Daten (DSGVO Art. 20)
- **Kontolöschung**: Self-Service-Löschung von Konto, Visitenkarte und Fotos (DSGVO Art. 17)
- **Responsive Dashboard**: Icons in Aktions-Buttons, responsive Grid-Layout, Hamburger-Menü für Mobilgeräte
- **Visitenkarten-Design**: DRK-Blau-Header (#002d55), Outline-Icons, klickbare Kontaktzeilen mit Hover-Feedback

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, SCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage) – EU-Region Frankfurt
- **QR-Code**: qrcode (Canvas + SVG)
- **Hosting**: Vercel (EU-Region Frankfurt) oder eigenes Server mit Coolify

## DSGVO / Datenschutz

Die Anwendung wurde unter Berücksichtigung der DSGVO und des TDDDG entwickelt:

- **Impressum & Datenschutzerklärung**: Vollständig ausgefüllt mit allen gesetzlich vorgeschriebenen Angaben (TMG §5, DSGVO Art. 13/14), DSB-Kontakt, Beschwerderecht (Art. 77)
- **Keine externen Ressourcen**: System-Fonts, inline SVG-Icons, keine Google Fonts, kein CDN
- **Keine Tracking-/Analyse-Cookies**: Nur technisch notwendige Auth-Session-Cookies (TDDDG §25 Abs. 2 Ausnahme)
- **Einwilligungshinweise**: Datenschutzhinweis beim Login, Einwilligungsinfo bei Veröffentlichung der Visitenkarte
- **Betroffenenrechte**: Datenexport (Art. 20) und Kontolöschung (Art. 17) als Self-Service im Dashboard
- **Auftragsverarbeiter dokumentiert**: Supabase (AVV/DPA) und Vercel bzw. eigener Server/Coolify (kein Drittanbieter-Hosting bei Self-Hosting)
- **Security Headers**: HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options
- **Impressum/Datenschutz-Links**: Auf allen Seiten erreichbar (2-Klick-Regel)

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
4. **API-Keys** erstellen:
   - Unter Settings > API Keys: Publishable Key (`sb_publishable_...`) für den Client
   - Unter Settings > API Keys: Secret Key (`sb_secret_...`) für serverseitige Admin-Operationen

### 3. Umgebungsvariablen

```bash
cp .env.example .env.local
```

Datei `.env.local` ausfüllen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ihr-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ihr-key
SUPABASE_SECRET_KEY=sb_secret_ihr-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ORG_NAME=DRK Kreisverband Aachen e.V.
```

> **Hinweis:** `SUPABASE_SECRET_KEY` wird nur serverseitig für Admin-Operationen (Kontolöschung) verwendet und niemals an den Client gesendet. Verwenden Sie den neuen Secret Key (`sb_secret_...`) statt des Legacy `service_role` JWT – er bietet unabhängige Rotation und zusätzlichen Browser-Schutz.

### 4. Starten

```bash
npm run dev
```

App ist unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Deployment

### Option A: Eigenes Server mit Coolify (Vercel-Alternative)

Coolify ist eine self-hosted Plattform für Builds, Deployments und SSL – ohne Vendor-Lock-in.

#### 1. Coolify auf dem Server installieren

**Voraussetzungen:**

- Server/VPS mit **Ubuntu 22.04+** oder **Debian 11+** (oder anderem Docker-tauglichen Linux)
- Mindestens **2 vCPU, 2 GB RAM, 30 GB SSD** (Produktion: 4 vCPU, 8 GB RAM, 80+ GB SSD empfohlen)
- Öffentliche IPv4-Adresse, Ports 80 und 443 erreichbar
- SSH-Zugang zum Server

**Installation (einzeilig):**

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Nach dem Lauf wird die Coolify-Web-Oberfläche unter der angezeigten URL (z.B. `http://<SERVER-IP>:8000`) erreichbar sein. Beim ersten Aufruf legst du ein Admin-Passwort fest.

Ausführliche Anleitung: [coolify.io/install](https://coolify.io/install).

#### 2. App von Repo auf den Server bringen (über Coolify)

Du musst **nichts manuell auf den Server kopieren**. Coolify baut und startet die App aus dem Git-Repository auf dem Server.

**Schritte in Coolify:**

1. **Projekt anlegen**  
   In Coolify: Neues Projekt erstellen (z.B. „DRK Visitenkarte“).

2. **Ressource hinzufügen**  
   - „Add new resource“ → **Application**.  
   - **Source**: Git – Repository-URL eintragen (HTTPS oder SSH).  
   - Optional: GitHub/GitLab/Bitbucket/Gitea verbinden, dann Repo auswählen.  
   - **Branch**: z.B. `main` oder `dev`.

3. **Build-Konfiguration**  
   - **Build Pack**: `Dockerfile` (im Projekt-Root liegt ein `Dockerfile`).  
   - **Ports Exposes**: `3000` (Next.js lauscht auf 3000).  
   - Keine weiteren Pflichtfelder für den Start.

4. **Umgebungsvariablen**  
   Unter „Environment Variables“ alle Werte aus `.env.example` eintragen (siehe lokale Entwicklung), angepasst an Produktion:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`
   - `NEXT_PUBLIC_SITE_URL` = finale App-URL (z.B. `https://visitenkarte.drk-aachen.de`)
   - `NEXT_PUBLIC_ORG_NAME` = euer Organisationsname

5. **Domain & SSL**  
   - In Coolify eine **Domain** für die App eintragen (z.B. `visitenkarte.drk-aachen.de`).  
   - Coolify kann automatisch **Let’s Encrypt SSL** einrichten (HTTPS).

6. **Deploy starten**  
   „Deploy“ auslösen. Coolify cloned das Repo auf dem Server, baut das Docker-Image (mit dem bereitgestellten `Dockerfile`) und startet den Container.  
   Danach ist die App unter der konfigurierten Domain erreichbar.

**Supabase anpassen:**

- In Supabase unter **Authentication → URL Configuration** die **Produktions-URL** (z.B. `https://visitenkarte.drk-aachen.de`) als **Site URL** und in **Redirect URLs** eintragen.

**Zusammenfassung:**  
Coolify einmal auf dem Server installieren, dann in der Coolify-UI das Git-Repo verbinden, Build Pack „Dockerfile“, Port 3000 und Umgebungsvariablen setzen. Die App wird auf dem Server aus dem Repo gebaut und betrieben – kein manuelles Kopieren von deinem Rechner nötig.

---

### Option B: Deployment (Vercel)

1. Repository mit Vercel verbinden
2. **Region auf Frankfurt (fra1) setzen** (Project Settings > Functions > Region)
3. Umgebungsvariablen in Vercel setzen (inkl. `SUPABASE_SECRET_KEY`)
4. `NEXT_PUBLIC_SITE_URL` auf die Produktions-URL setzen (z.B. `https://visitenkarte.drk-aachen.de`)
5. In Supabase die Produktions-URL als Redirect-URL hinzufügen
6. **DPAs unterzeichnen**: Supabase DPA (Dashboard > Settings > Legal) und Vercel DPA (in ToS enthalten)

## Projektstruktur

```
├── app/                    # Next.js App Router Seiten
│   ├── api/account/        # Server-side API-Routen
│   │   ├── delete/         # Kontolöschung (DSGVO Art. 17)
│   │   └── export/         # Datenexport (DSGVO Art. 20)
│   ├── c/[slug]/           # Öffentliche Visitenkarten-Seite
│   │   └── vcard/          # vCard Download API
│   ├── dashboard/          # Geschützter Bereich
│   │   ├── edit/           # Visitenkarte bearbeiten
│   │   ├── qr/             # QR-Code exportieren
│   │   └── settings/       # Konto & Datenschutz (Export, Löschung)
│   ├── login/              # Magic-Link Login
│   ├── datenschutz/        # Datenschutzerklärung
│   └── impressum/          # Impressum
├── components/             # React-Komponenten
│   ├── account/            # Kontoverwaltung (Export, Löschung)
│   ├── auth/               # Login, Logout
│   ├── card/               # Öffentliche Kartenansicht
│   ├── editor/             # Kartenformular
│   └── qr/                 # QR-Code Generierung & Export
├── lib/                    # Shared Libraries
│   ├── supabase/           # Client, Server, Admin, Types
│   ├── vcard.ts            # vCard 3.0 Generator
│   ├── slug.ts             # URL-Slug Generierung
│   └── photo.ts            # Foto-Validierung & URLs
├── styles/                 # Globale SCSS Styles & Design Tokens
├── supabase/migrations/    # SQL-Migrationen
├── middleware.ts            # Auth Session Refresh & Route Protection
├── Dockerfile               # Produktions-Image für Coolify/eigenen Server
├── .dockerignore            # Ausschlüsse für Docker-Build
└── public/                 # Statische Assets (DRK Logo, Favicon)
```

## Anpassung für andere DRK-Verbände

1. `NEXT_PUBLIC_ORG_NAME` in `.env.local` anpassen
2. Impressum in `app/impressum/page.tsx` mit eigenen Organisationsdaten füllen
3. Datenschutzerklärung in `app/datenschutz/page.tsx` anpassen (Verantwortlicher, DSB, Aufsichtsbehörde)
4. Optional: Logo in `public/drk-logo.svg` und `public/favicon.svg` austauschen
5. Eigenes Supabase-Projekt erstellen und konfigurieren (EU-Region!)

## Rechtliches

- **Impressum**: Befüllt mit Angaben des DRK-Kreisverband Städteregion Aachen e.V. (TMG §5, MStV §18)
- **Datenschutzerklärung**: 13 Abschnitte inkl. Verantwortlicher, DSB, Auftragsverarbeiter, Betroffenenrechte, Beschwerderecht
- **Supabase DPA**: Auftragsverarbeitungsvereinbarung erforderlich (Dashboard > Settings > Legal)
- **Vercel DPA** (nur bei Vercel-Hosting): In den allgemeinen Geschäftsbedingungen enthalten, inkl. EU-Standardvertragsklauseln (SCCs). Bei Self-Hosting mit Coolify entfällt Vercel.

## Lizenz

Intern – DRK Kreisverband Aachen e.V.
