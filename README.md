# DRK Digitale Visitenkarte

Digitale Visitenkarten-App für das Deutsche Rote Kreuz. Mitarbeitende können ihre eigene Visitenkarte erstellen, als QR-Code teilen und Kontaktdaten per vCard zum Herunterladen anbieten.

## Features

- **Self-Service**: Jede/r Mitarbeitende erstellt und verwaltet die eigene Visitenkarte
- **QR-Code**: Generierung mit DRK-Logo, Download als PNG (Druck) oder SVG (Vektor)
- **Kontakt speichern**: vCard 3.0 Download – ein Klick zum Speichern im Adressbuch
- **Teilen**: Web Share API / Link kopieren
- **Fotos**: Upload von Profilfotos (JPEG, PNG, WebP, max. 2 MB)
- **DSGVO-konform**: Self-Hosted, keine externen Dienste auf öffentlichen Seiten, kein Tracking, Security Headers
- **SSO-Login**: Authentik (OpenID Connect) – zentrale Benutzerverwaltung
- **Open Graph**: Rich-Link-Previews beim Teilen auf Social Media
- **Datenexport**: JSON-Export aller persönlichen Daten (DSGVO Art. 20)
- **Kontolöschung**: Self-Service-Löschung von Konto, Visitenkarte und Fotos (DSGVO Art. 17)
- **Responsive Dashboard**: Icons in Aktions-Buttons, responsive Grid-Layout, Hamburger-Menü für Mobilgeräte
- **Visitenkarten-Design**: DRK-Blau-Header (#002d55), Outline-Icons, klickbare Kontaktzeilen mit Hover-Feedback

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, SCSS
- **Datenbank**: PostgreSQL via Prisma ORM
- **Authentifizierung**: Auth.js (NextAuth v5) mit Authentik OIDC Provider
- **Dateispeicher**: Garage (S3-kompatibel) via AWS SDK
- **Hosting**: Eigener Server mit Coolify

## DSGVO / Datenschutz

Die Anwendung wurde unter Berücksichtigung der DSGVO und des TDDDG entwickelt:

- **100 % Self-Hosted**: Datenbank, Dateispeicher, Authentifizierung und Hosting laufen auf eigener Infrastruktur – keine Drittanbieter-Datenverarbeitung
- **Impressum & Datenschutzerklärung**: Vollständig ausgefüllt mit allen gesetzlich vorgeschriebenen Angaben (TMG §5, DSGVO Art. 13/14), DSB-Kontakt, Beschwerderecht (Art. 77)
- **Keine externen Ressourcen**: System-Fonts, inline SVG-Icons, keine Google Fonts, kein CDN
- **Keine Tracking-/Analyse-Cookies**: Nur technisch notwendige Auth-Session-Cookies (TDDDG §25 Abs. 2 Ausnahme)
- **Einwilligungshinweise**: Datenschutzhinweis beim Login, Einwilligungsinfo bei Veröffentlichung der Visitenkarte
- **Betroffenenrechte**: Datenexport (Art. 20) und Kontolöschung (Art. 17) als Self-Service im Dashboard
- **Security Headers**: HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options
- **Impressum/Datenschutz-Links**: Auf allen Seiten erreichbar (2-Klick-Regel)

## Schnellstart

### Voraussetzungen

- Node.js >= 20
- PostgreSQL-Datenbank
- Garage (S3-kompatibler Objektspeicher)
- Authentik-Instanz mit OIDC-Anwendung

### 1. Repository klonen & installieren

```bash
git clone <repo-url>
cd drk-digital-business-card
npm install
```

### 2. Infrastruktur einrichten (Coolify)

#### PostgreSQL

Über Coolify One-Click deployen. Notieren: Host, Port, Datenbankname, Benutzer, Passwort.

#### Garage (S3-kompatibler Speicher)

Über Coolify deployen. Bucket `photos` mit öffentlichem Lesezugriff erstellen:

```bash
garage bucket create photos
garage bucket allow --read --write photos --key <key-id>
```

Notieren: S3-API-Endpoint-URL, Access Key ID, Secret Key.

#### Authentik (OIDC Provider)

1. Neue OAuth2/OIDC-Anwendung erstellen
2. Redirect URI setzen: `https://your-app-domain.de/api/auth/callback/authentik`
3. Notieren: Client ID, Client Secret, Issuer URL (z.B. `https://auth.your-domain.de/application/o/visitenkarte/`)

### 3. Umgebungsvariablen

```bash
cp .env.example .env.local
```

Datei `.env.local` ausfüllen:

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/visitenkarte

# Auth.js – generieren mit: openssl rand -base64 32
AUTH_SECRET=ihr-auth-secret

# Authentik OIDC
AUTH_AUTHENTIK_ID=ihr-client-id
AUTH_AUTHENTIK_SECRET=ihr-client-secret
AUTH_AUTHENTIK_ISSUER=https://auth.your-domain.de/application/o/visitenkarte/

# Garage (S3)
S3_ENDPOINT=https://garage.your-domain.de
S3_ACCESS_KEY=ihr-access-key
S3_SECRET_KEY=ihr-secret-key
S3_BUCKET=photos
NEXT_PUBLIC_S3_PUBLIC_URL=https://garage.your-domain.de/photos

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ORG_NAME=DRK Kreisverband Aachen e.V.
```

### 4. Datenbank initialisieren

```bash
npx prisma migrate deploy
```

Dies wendet die versionierten Migrationen aus `prisma/migrations/` auf die Datenbank an und erstellt dabei alle Tabellen (Users, Accounts, Sessions, Cards, VerificationTokens). Für neue Schema-Änderungen während der Entwicklung:

```bash
npx prisma migrate dev --name <aenderungs-name>
```

### 5. Starten

```bash
npm run dev
```

App ist unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Deployment (Coolify)

### 1. Coolify auf dem Server installieren

**Voraussetzungen:**

- Server/VPS mit **Ubuntu 22.04+** oder **Debian 11+**
- Mindestens **2 vCPU, 2 GB RAM, 30 GB SSD** (Produktion: 4 vCPU, 8 GB RAM, 80+ GB SSD empfohlen)
- Öffentliche IPv4-Adresse, Ports 80 und 443 erreichbar
- SSH-Zugang zum Server

**Installation:**

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Ausführliche Anleitung: [coolify.io/install](https://coolify.io/install).

### 2. Dienste deployen

1. **PostgreSQL** über Coolify One-Click deployen
2. **Garage** über Coolify deployen und Bucket konfigurieren
3. **Authentik** über Coolify deployen und OIDC-Anwendung erstellen

### 3. App deployen

1. **Projekt anlegen** in Coolify
2. **Ressource hinzufügen**: Application → Git → Repository-URL → Branch `main`
3. **Build Pack**: `Dockerfile`
4. **Port**: `3000`
5. **Umgebungsvariablen** eintragen (alle aus `.env.example`)
6. **Domain & SSL** konfigurieren (Let's Encrypt)
7. **Deploy** starten

### 4. Datenbank-Migrationen

Die Datenbank-Migrationen werden beim Containerstart **automatisch** ausgeführt. Der `CMD` im [Dockerfile](Dockerfile) führt `prisma migrate deploy` aus, bevor die Next.js-Anwendung gestartet wird. Für eine **leere PROD-Datenbank** (Neuinstallation) wird dadurch beim ersten Deploy das komplette Schema aus `prisma/migrations/0_init/migration.sql` angelegt – kein manueller Eingriff notwendig.

#### Bestehende Datenbank ohne Migrationshistorie baselinen

Falls eine vorhandene Datenbank ursprünglich mit `prisma db push` initialisiert wurde (z.B. die bestehende DEV-Datenbank aus einer früheren Version dieser App), existiert in ihr keine `_prisma_migrations`-Tabelle. Beim ersten Deploy mit aktiviertem `migrate deploy` würde Prisma versuchen, das Schema erneut anzulegen und fehlschlagen. Einmalig baselinen:

```bash
# In Coolify Terminal des App-Containers oder lokal mit gesetztem DATABASE_URL
npx prisma migrate resolve --applied 0_init
```

Dies markiert die `0_init`-Migration als bereits angewendet. Alle künftigen Migrationen laufen dann regulär.

### 5. Erstes Deploy der PROD-Umgebung

Checkliste für ein sauberes PROD-Deployment:

1. **PostgreSQL (PROD)**: Eigene, leere Datenbank einrichten (separat von DEV). Keine manuelle Migration nötig.
2. **Authentik (PROD)**: Eigenen OIDC Provider + Application anlegen (getrennt von DEV).
   - Redirect URI: `https://<prod-domain>/api/auth/callback/authentik`
   - Issuer URL in `AUTH_AUTHENTIK_ISSUER` muss exakt übereinstimmen (inkl. abschließendem Slash).
3. **Garage (PROD)**: Eigenen Bucket anlegen, öffentlichen Lesezugriff gewähren, Access Key erzeugen. `NEXT_PUBLIC_S3_PUBLIC_URL` muss auf den öffentlich erreichbaren Bucket-URL zeigen.
4. **`AUTH_SECRET`** neu generieren (nicht aus DEV wiederverwenden):
   ```bash
   openssl rand -base64 32
   ```
5. **Alle Environment-Variablen** aus [.env.example](.env.example) in Coolify setzen – insbesondere `NEXT_PUBLIC_SITE_URL` auf die PROD-Domain (mit `https://`).
6. **Deploy starten**: `prisma migrate deploy` legt die Tabellen automatisch an.
7. **Smoke-Test**: Login → Karte erstellen → veröffentlichen → QR-Code scannen → vCard herunterladen.

## Projektstruktur

```
├── app/                    # Next.js App Router Seiten
│   ├── api/
│   │   ├── account/        # Kontolöschung (DSGVO Art. 17), Datenexport (Art. 20)
│   │   ├── auth/           # Auth.js Route Handler (Sign-In, Callback, etc.)
│   │   ├── cards/          # Visitenkarten CRUD + Slug-Prüfung
│   │   └── photos/         # Foto-Upload zu S3/Garage
│   ├── c/[slug]/           # Öffentliche Visitenkarten-Seite + vCard + OG Image
│   ├── dashboard/          # Geschützter Bereich (Übersicht, Editor, QR, Konto)
│   ├── login/              # Authentik OIDC Login
│   ├── datenschutz/        # Datenschutzerklärung
│   └── impressum/          # Impressum
├── components/             # React-Komponenten
│   ├── account/            # Kontoverwaltung (Export, Löschung)
│   ├── auth/               # Login (Authentik), Logout
│   ├── card/               # Öffentliche Kartenansicht
│   ├── editor/             # Kartenformular
│   └── qr/                 # QR-Code Generierung & Export
├── lib/                    # Shared Libraries
│   ├── auth.config.ts      # Edge-kompatible Auth.js Konfiguration
│   ├── auth.ts             # Auth.js mit Prisma Adapter
│   ├── db.ts               # Prisma Client Singleton
│   ├── storage.ts          # S3/Garage Upload/Delete
│   ├── types.ts            # Typ-Aliase (CardRow)
│   ├── vcard.ts            # vCard 3.0 Generator
│   ├── slug.ts             # URL-Slug Generierung
│   ├── photo.ts            # Foto-Validierung & URLs
│   └── url.ts              # Site-URL Helper
├── prisma/
│   ├── schema.prisma       # Datenbankschema (Cards + Auth.js Tabellen)
│   └── migrations/         # Versionierte SQL-Migrationen (automatisch beim Container-Start angewendet)
├── styles/                 # Globale SCSS Styles & Design Tokens
├── middleware.ts            # Auth Session Check & Route Protection
├── Dockerfile              # Produktions-Image für Coolify
├── .dockerignore            # Ausschlüsse für Docker-Build
└── public/                 # Statische Assets (DRK Logo, Favicon)
```

## Anpassung für andere DRK-Verbände

1. `NEXT_PUBLIC_ORG_NAME` in `.env.local` anpassen
2. Impressum in `app/impressum/page.tsx` mit eigenen Organisationsdaten füllen
3. Datenschutzerklärung in `app/datenschutz/page.tsx` anpassen (Verantwortlicher, DSB, Aufsichtsbehörde)
4. Optional: Logo in `public/drk-logo.svg` und `public/favicon.svg` austauschen
5. Eigene Infrastruktur aufsetzen (PostgreSQL, Garage, Authentik)

## Rechtliches

- **Impressum**: Befüllt mit Angaben des DRK-Kreisverband Städteregion Aachen e.V. (TMG §5, MStV §18)
- **Datenschutzerklärung**: Abschnitte inkl. Verantwortlicher, DSB, Betroffenenrechte, Beschwerderecht – angepasst an Self-Hosting (keine Drittanbieter-Auftragsverarbeiter)

## Lizenz

Intern – DRK Kreisverband Aachen e.V.
