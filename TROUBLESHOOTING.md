# 🔧 Troubleshooting Guide

## ❌ "Failed to fetch history data" Error

### Problem
Die Status-Timeline zeigt den Fehler: `{"error":"Failed to fetch history data"}`

### Lösungsschritte

#### 1. **Monitoring-Server Status prüfen**
```bash
# Auf VPS einloggen und prüfen
pm2 status
pm2 logs status-monitor --lines 20
```

#### 2. **API-Endpunkte testen**
```bash
# Health Check
curl http://localhost:3001/health

# Status API
curl http://localhost:3001/api/status

# History Test Endpoint
curl http://localhost:3001/api/history/test

# History API
curl "http://localhost:3001/api/history?days=7"
```

#### 3. **Automatischer API-Test**
```bash
cd /path/to/monitoring-server
chmod +x test-api.sh
./test-api.sh
```

### Häufige Ursachen & Lösungen

#### 🔴 **Monitoring-Server läuft nicht**
```bash
# Server neustarten
pm2 restart status-monitor

# Oder komplettes Neu-Deployment
./fresh-deploy.sh
```

#### 🔴 **Port 3001 nicht erreichbar**
```bash
# Port-Status prüfen
netstat -tlnp | grep 3001

# Firewall prüfen
sudo ufw status
sudo ufw allow 3001
```

#### 🔴 **CORS-Probleme**
```bash
# .env Datei prüfen
cat .env | grep ALLOWED_ORIGINS

# Sollte enthalten:
# ALLOWED_ORIGINS=https://moritxius.de,http://localhost:3000
```

#### 🔴 **Environment Variable fehlt**
```bash
# Vercel Environment Variable setzen
MONITORING_SERVER_URL=http://18.193.42.105:3001

# Lokal in .env.local
echo "MONITORING_SERVER_URL=http://18.193.42.105:3001" >> .env.local
```

## 🔍 **Debug-Modus aktivieren**

### Frontend Debug
```javascript
// In components/status/StatusTimeline.tsx
console.log(`Fetching timeline data for service: ${serviceId}`)
```

### Backend Debug
```javascript
// In monitoring-server/src/routes/history.js
console.log(`Fetching history data for service: ${service}, days: ${days}`)
```

## 📊 **Mock-Daten vs. Echte Daten**

### Aktuell: Mock-Daten
- Die Timeline verwendet derzeit **Mock-Daten**
- Das ist normal für neue Deployments
- Echte historische Daten sammeln sich über Zeit

### Umstellung auf echte Daten
```javascript
// In monitoring-server/src/routes/history.js
// Kommentierte Sektion aktivieren wenn genug Daten vorhanden
```

## 🚨 **Notfall-Lösungen**

### 1. **Frontend-Fallback aktivieren**
```typescript
// In app/api/status/history/route.ts
// Mock-Daten werden automatisch als Fallback verwendet
```

### 2. **Monitoring-Server Reset**
```bash
# Kompletter Reset
pm2 stop status-monitor
pm2 delete status-monitor
rm -f data/status.db
./fresh-deploy.sh
```

### 3. **Nur Frontend neu deployen**
```bash
# Vercel
vercel --prod

# Oder lokal
npm run build
npm start
```

## 📋 **Checkliste für funktionierendes System**

- [ ] PM2 zeigt "status-monitor" als "online"
- [ ] `curl http://localhost:3001/health` antwortet
- [ ] `curl http://localhost:3001/api/status` antwortet
- [ ] `curl http://localhost:3001/api/history/test` antwortet
- [ ] Port 3001 ist von außen erreichbar
- [ ] CORS ist korrekt konfiguriert
- [ ] Environment Variables sind gesetzt
- [ ] Frontend kann auf Monitoring-Server zugreifen

## 🔄 **Regelmäßige Wartung**

### Logs rotieren
```bash
pm2 flush  # Logs leeren
```

### Datenbank bereinigen
```bash
sqlite3 data/status.db "DELETE FROM status_checks WHERE checked_at < datetime('now', '-30 days');"
```

### Performance überwachen
```bash
pm2 monit  # Ressourcenverbrauch anzeigen
```

## 📞 **Support-Informationen sammeln**

Bei anhaltenden Problemen diese Informationen sammeln:

```bash
# System-Info
uname -a
node --version
npm --version
pm2 --version

# Service-Status
pm2 status
pm2 logs status-monitor --lines 50

# API-Tests
curl -v http://localhost:3001/health
curl -v http://localhost:3001/api/history/test

# Netzwerk
netstat -tlnp | grep 3001
ss -tlnp | grep 3001

# Disk Space
df -h
du -sh data/
```