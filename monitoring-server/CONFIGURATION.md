# ⚙️ Monitoring Server Konfiguration

## 🕐 Check-Intervall Einstellungen

### Standard-Konfiguration
- **Check-Intervall**: 5 Sekunden (5000ms)
- **Service-Timeout**: 5 Sekunden
- **Datenaufbewahrung**: 30 Tage

### Anpassung des Check-Intervalls

#### Option 1: Environment Variable
```bash
# In .env Datei
CHECK_INTERVAL=5000    # 5 Sekunden
CHECK_INTERVAL=10000   # 10 Sekunden
CHECK_INTERVAL=30000   # 30 Sekunden
CHECK_INTERVAL=60000   # 1 Minute
```

#### Option 2: Beim Start setzen
```bash
CHECK_INTERVAL=3000 pm2 start ecosystem.config.js
```

#### Option 3: PM2 Ecosystem Konfiguration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'status-monitor',
    script: 'server.js',
    env: {
      CHECK_INTERVAL: 5000  // 5 Sekunden
    }
  }]
}
```

## 📊 Empfohlene Intervalle

### Produktionsumgebung
- **Kritische Services**: 5-10 Sekunden
- **Standard Services**: 30-60 Sekunden
- **Externe APIs**: 60-300 Sekunden

### Entwicklungsumgebung
- **Lokale Services**: 5-15 Sekunden
- **Test-APIs**: 30-60 Sekunden

## ⚡ Performance-Überlegungen

### Bei 5-Sekunden-Intervall:
- **Checks pro Stunde**: 720 pro Service
- **Bei 6 Services**: 4.320 Checks/Stunde
- **Datenbank-Einträge**: ~103.680 pro Tag
- **Speicherbedarf**: ~10-50 MB pro Monat

### Optimierungen:
```bash
# Kürzere Datenaufbewahrung für häufige Checks
RETENTION_DAYS=7      # Nur 7 Tage statt 30

# Längere Timeouts für langsamere Services
SERVICE_TIMEOUT=10000 # 10 Sekunden
```

## 🔧 Service-spezifische Konfiguration

### Verschiedene Intervalle pro Service-Typ
```javascript
// Zukünftige Erweiterung - verschiedene Intervalle
const serviceConfig = {
  'critical': 5000,    // 5 Sekunden
  'standard': 30000,   // 30 Sekunden
  'external': 60000    // 1 Minute
}
```

## 📈 Monitoring der Performance

### Logs überprüfen
```bash
# Check-Frequenz in Logs
pm2 logs status-monitor | grep "Monitoring scheduled"

# Performance-Metriken
pm2 monit
```

### Datenbank-Größe überwachen
```bash
# SQLite Datenbank-Größe
ls -lh data/status.db

# Anzahl der Einträge
sqlite3 data/status.db "SELECT COUNT(*) FROM status_checks;"
```

## 🚨 Troubleshooting

### Zu häufige Checks (Performance-Probleme)
```bash
# Intervall erhöhen
CHECK_INTERVAL=30000 pm2 restart status-monitor
```

### Zu seltene Checks (verpasste Ausfälle)
```bash
# Intervall verringern
CHECK_INTERVAL=3000 pm2 restart status-monitor
```

### Datenbank zu groß
```bash
# Aufbewahrungszeit reduzieren
RETENTION_DAYS=7 pm2 restart status-monitor

# Oder alte Daten manuell löschen
sqlite3 data/status.db "DELETE FROM status_checks WHERE checked_at < datetime('now', '-7 days');"
```

## 🎯 Aktuelle Konfiguration anzeigen

```bash
# Environment-Variablen anzeigen
pm2 show status-monitor | grep -A 10 "Environment"

# Oder direkt testen
curl http://localhost:3001/api/config
```