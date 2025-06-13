# Matsuda Béla Website

Eine Next.js Website mit Relais-Steuerungssystem.

## Features

- **Hauptseite**: Einfache Willkommensseite
- **Authentifizierung**: Clerk-basierte Benutzeranmeldung
- **Berechtigungssystem**: Zugriff nur mit `relais=1` oder `admin=1` in Public Metadata
- **Relais Steuerung**: Steuerung von 16 Relais über API
- **Kompakte Karten**: Kleinere Relais-Karten für bessere Übersicht
- **Responsive Design**: Funktioniert auf Desktop und Mobile
- **Real-time Status**: Automatische Aktualisierung alle 5 Sekunden

## API Integration

Die Website kommuniziert mit der API unter `door.moritxius.de`:

- **Status abrufen**: `GET /api/status`
- **Relais steuern**: `POST /api/[relaisnummer]/[open/close]`
- **Authentifizierung**: Header `x-api-password` erforderlich

## Setup

### 1. Clerk Konfiguration

1. Erstellen Sie einen Account bei [Clerk](https://dashboard.clerk.com/)
2. Erstellen Sie eine neue Anwendung
3. Kopieren Sie die API Keys in `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### 2. Benutzerberechtigungen

Um Benutzern Zugriff auf die Relais-Steuerung zu geben:

1. Gehen Sie zu Clerk Dashboard → Users
2. Wählen Sie einen Benutzer aus
3. Bearbeiten Sie "Public metadata"
4. Fügen Sie hinzu:
   ```json
   {
     "relais": 1
   }
   ```
   oder für Admin-Rechte:
   ```json
   {
     "admin": 1
   }
   ```

### 3. Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build
npm run build
npm start
```

## Deployment auf Vercel

1. Repository zu GitHub pushen
2. Vercel Account verbinden
3. Projekt importieren
4. Automatisches Deployment

## Technologien

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Clerk für Authentifizierung
- Axios für API Calls

## Struktur

```
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx (Hauptseite)
│   └── relais/
│       └── page.tsx (Relais Steuerung)
├── components/
│   ├── Navbar.tsx
│   └── RelaisCard.tsx
└── ...
```