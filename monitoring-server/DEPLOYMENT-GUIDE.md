# 🚀 Monitoring Server - Komplettes Neu-Deployment

## 📋 Vorbereitung

### 1. Dateien auf VPS hochladen
Laden Sie den kompletten `monitoring-server` Ordner auf Ihren VPS hoch:

```bash
# Beispiel mit scp
scp -r monitoring-server/ user@18.193.42.105:/path/to/deployment/
```

### 2. Auf VPS einloggen
```bash
ssh user@18.193.42.105
cd /path/to/deployment/monitoring-server
```

## 🔧 Deployment ausführen

### Einfaches Deployment
```bash
# Skript ausführbar machen
chmod +x deploy.sh

# Deployment starten
./deploy.sh
```

Das Skript wird automatisch:
- ✅ Alte Prozesse stoppen und löschen
- ✅ Alte Datenbank entfernen (für frischen Start)
- ✅ Dependencies installieren
- ✅ PM2 konfigurieren
- ✅ Anwendung starten
- ✅ Health-Checks durchführen

## 📊 Nach dem Deployment

### Status überprüfen
```bash
# PM2 Status
pm2 status

# Logs anzeigen
pm2 logs status-monitor

# API testen
curl http://localhost:3001/health
curl http://localhost:3001/api/status
```

### Erwartete Ergebnisse
- ✅ Overall Status: "operational"
- ✅ Alle Services: "operational" (auch bei 403-Status)
- ✅ Upstash Redis: 403 Status (normal, da Auth erforderlich)
- ✅ Website Services: 200 Status
- ✅ Services werden alle 5 Sekunden überprüft
- ✅ Status-Updates sind nahezu in Echtzeit

## 🔍 Troubleshooting

### Logs überprüfen
```bash
pm2 logs status-monitor --lines 50
```

### Service manuell neustarten
```bash
pm2 restart status-monitor
```

### Datenbank überprüfen
```bash
sqlite3 data/status.db "SELECT id, name, url, status FROM services;"
```

### Port überprüfen
```bash
netstat -tlnp | grep 3001
```

## 🌐 Frontend-Konfiguration

Nach erfolgreichem Deployment müssen Sie auch das Frontend aktualisieren:

### Vercel Environment Variables
1. Gehen Sie zu Vercel Dashboard
2. Projekt auswählen → Settings → Environment Variables
3. Setzen Sie: `MONITORING_SERVER_URL=http://18.193.42.105:3001`
4. Deployment triggern

### Lokale Entwicklung
```bash
# In .env.local
MONITORING_SERVER_URL=http://18.193.42.105:3001
```

## ✅ Erfolgskriterien

Das Deployment ist erfolgreich, wenn:
- [ ] PM2 zeigt "status-monitor" als "online"
- [ ] Health-Check antwortet: `curl http://localhost:3001/health`
- [ ] Status-API antwortet: `curl http://localhost:3001/api/status`
- [ ] Overall Status ist "operational"
- [ ] Frontend zeigt korrekte Status-Informationen

## 🆘 Support

Bei Problemen:
1. Logs überprüfen: `pm2 logs status-monitor`
2. Prozess-Status: `pm2 status`
3. Port-Verfügbarkeit: `netstat -tlnp | grep 3001`
4. Firewall-Einstellungen überprüfen