# VPS Update Anleitung

## Problem
Der Monitoring-Server zeigt "Invalid URL" für Upstash Redis, weil die Service-URLs in der Datenbank nicht korrekt konfiguriert sind.

## Lösung

### 1. Auf dem VPS einloggen und zum Monitoring-Server navigieren
```bash
cd /path/to/monitoring-server
```

### 2. Die neuen Dateien hochladen
Laden Sie diese Dateien auf den VPS hoch:
- `update-services.js`
- `update-deployment.sh`

### 3. Update ausführen
```bash
# Skript ausführbar machen
chmod +x update-deployment.sh

# Update ausführen
./update-deployment.sh
```

### 4. Manuell die Services in der Datenbank aktualisieren
Falls das Skript nicht funktioniert, können Sie die Datenbank manuell aktualisieren:

```bash
# SQLite öffnen
sqlite3 data/status.db

# Services anzeigen
SELECT id, name, url FROM services;

# URLs aktualisieren
UPDATE services SET url = 'https://epic-werewolf-17800.upstash.io' WHERE id = 'upstash-redis';
UPDATE services SET url = 'https://moritxius.de' WHERE id = 'main-website';
UPDATE services SET url = 'https://moritxius.de/guides' WHERE id = 'guides-system';
UPDATE services SET url = 'https://moritxius.de/api/comments' WHERE id = 'comments-api';
UPDATE services SET url = 'https://moritxius.de/api/guides' WHERE id = 'guides-api';

# Änderungen bestätigen
SELECT id, name, url FROM services;

# SQLite verlassen
.quit
```

### 5. Monitoring-Server neustarten
```bash
pm2 restart status-monitor
```

### 6. Status überprüfen
```bash
# Logs anzeigen
pm2 logs status-monitor

# Status-API testen
curl http://localhost:3001/api/status

# Health-Check
curl http://localhost:3001/health
```

## Erwartetes Ergebnis
Nach dem Update sollten alle Services korrekt überwacht werden:
- ✅ Hauptwebsite: https://moritxius.de
- ✅ Guides System: https://moritxius.de/guides  
- ✅ Clerk Authentication: https://api.clerk.dev/v1/health
- ✅ Upstash Redis: https://epic-werewolf-17800.upstash.io
- ✅ Kommentar API: https://moritxius.de/api/comments
- ✅ Guides API: https://moritxius.de/api/guides

## Troubleshooting

### Services werden immer noch als "major_outage" angezeigt
```bash
# Prüfen Sie die Logs für Fehlerdetails
pm2 logs status-monitor --lines 50

# Manuell einen Service testen
curl -v https://epic-werewolf-17800.upstash.io
```

### Datenbank-Probleme
```bash
# Datenbank-Berechtigungen prüfen
ls -la data/status.db

# Backup erstellen
cp data/status.db data/status.db.backup
```