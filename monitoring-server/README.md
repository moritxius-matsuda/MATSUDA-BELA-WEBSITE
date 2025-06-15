# Status Monitoring Server

Ein eigenständiger Node.js-Server für die Überwachung der Website-Services und APIs.

## Features

- 🔍 **Automatische Service-Überwachung** - Überprüft alle konfigurierten Services jede Minute
- 📊 **SQLite-Datenbank** - Speichert Status-Historie und Incidents
- 🚨 **Incident-Management** - Erstellen und verwalten von Vorfällen
- 🔧 **Wartungsfenster** - Planen von Wartungsarbeiten
- 📈 **Uptime-Statistiken** - Detaillierte Verfügbarkeitsstatistiken
- 🌐 **REST API** - Vollständige API für Frontend-Integration
- ⚡ **PM2-Integration** - Production-ready mit Process Management

## Installation

### Auf dem VPS

1. **Repository klonen:**
```bash
git clone <your-repo-url>
cd monitoring-server
```

2. **Dependencies installieren:**
```bash
npm install
```

3. **Environment konfigurieren:**
```bash
cp .env.example .env
# .env-Datei bearbeiten
```

4. **Deployment ausführen:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Lokale Entwicklung

```bash
npm install
npm run dev
```

## Konfiguration

### Environment Variables (.env)

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=https://moritxius.de,http://localhost:3000

# External Services
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
```

### Services konfigurieren

Services werden automatisch in der Datenbank erstellt. Sie können über die API oder direkt in der SQLite-Datenbank bearbeitet werden.

## API Endpoints

### Status
- `GET /api/status` - Aktueller System-Status
- `GET /api/status/service/:serviceId` - Status-Historie für einen Service
- `GET /api/status/uptime/:serviceId` - Uptime-Statistiken

### Incidents
- `GET /api/incidents` - Alle Incidents
- `POST /api/incidents` - Neuen Incident erstellen
- `PUT /api/incidents/:id` - Incident aktualisieren
- `DELETE /api/incidents/:id` - Incident löschen

### Maintenance
- `GET /api/maintenance` - Alle Wartungsfenster
- `POST /api/maintenance` - Wartungsfenster erstellen
- `PUT /api/maintenance/:id` - Wartungsfenster aktualisieren
- `DELETE /api/maintenance/:id` - Wartungsfenster löschen

## PM2 Commands

```bash
# Server starten
pm2 start ecosystem.config.js

# Status anzeigen
pm2 status

# Logs anzeigen
pm2 logs status-monitor

# Server neustarten
pm2 restart status-monitor

# Server stoppen
pm2 stop status-monitor

# Monitoring Dashboard
pm2 monit
```

## Monitoring

Der Server überwacht automatisch:

- **Website & Frontend**
  - Hauptwebsite (moritxius.de)
  - Guides System

- **Authentifizierung**
  - Clerk Authentication

- **Datenbank & Storage**
  - Upstash Redis

- **APIs & Services**
  - Kommentar API
  - Guides API

## Datenbank

Verwendet SQLite für einfache Deployment und Wartung:

- `data/status.db` - Hauptdatenbank
- Automatische Tabellenerstellung beim ersten Start
- Automatische Bereinigung alter Einträge

## Logs

- `logs/out.log` - Standard Output
- `logs/err.log` - Error Logs
- `logs/combined.log` - Kombinierte Logs

## Frontend Integration

Das Next.js Frontend verbindet sich über die Environment Variable:

```env
MONITORING_SERVER_URL=http://your-vps-ip:3001
```

## Sicherheit

- CORS-Konfiguration für erlaubte Origins
- Helmet.js für Security Headers
- Kompression für bessere Performance
- Graceful Shutdown Handling

## Troubleshooting

### Server startet nicht
```bash
# Logs prüfen
pm2 logs status-monitor

# Port prüfen
netstat -tulpn | grep 3001

# Prozess neustarten
pm2 restart status-monitor
```

### Datenbank-Probleme
```bash
# Datenbank-Datei prüfen
ls -la data/status.db

# Berechtigungen setzen
chmod 664 data/status.db
```

### Services werden nicht überwacht
```bash
# Cron-Jobs prüfen (in den Logs)
pm2 logs status-monitor | grep "Checking"
```

## Erweiterungen

### Neue Services hinzufügen

Services können über die Datenbank oder API hinzugefügt werden:

```sql
INSERT INTO services (id, name, description, url, category) 
VALUES ('new-service', 'New Service', 'Description', 'https://example.com', 'apis');
```

### Benachrichtigungen

Erweitern Sie den Monitor um Webhook-Benachrichtigungen für Discord, Slack oder E-Mail.

### Custom Health Checks

Implementieren Sie spezielle Health-Check-Logik für verschiedene Service-Typen.