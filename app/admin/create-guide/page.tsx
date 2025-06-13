'use client'

import { useState } from 'react'

export default function CreateGuidePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const createProxmoxGuide = async () => {
    setLoading(true)
    setMessage('')

    const proxmoxGuide = {
      title: "Proxmox VE Installation und Konfiguration",
      description: "Komplette Anleitung zur Installation und Grundkonfiguration von Proxmox Virtual Environment",
      category: "Virtualisierung",
      operatingSystem: ["Linux", "Debian"],
      difficulty: "Mittel",
      readTime: "45 Minuten",
      slug: "proxmox-ve-installation-konfiguration",
      tags: ["proxmox", "virtualisierung", "hypervisor", "debian", "server"],
      author: "Matsuda Bela",
      authorRole: "System Administrator",
      authorImage: "/images/author.jpg",
      sections: [
        {
          title: "Systemanforderungen",
          content: `Bevor Sie mit der Installation beginnen, stellen Sie sicher, dass Ihr System die folgenden Mindestanforderungen erfüllt:

• CPU: 64-bit Prozessor mit Virtualisierungsunterstützung (Intel VT-x oder AMD-V)
• RAM: Mindestens 2 GB (empfohlen: 8 GB oder mehr)
• Festplatte: Mindestens 32 GB freier Speicherplatz
• Netzwerk: Ethernet-Verbindung
• BIOS/UEFI: Virtualisierung muss aktiviert sein

Überprüfen Sie die Virtualisierungsunterstützung mit folgendem Befehl:`,
          path: "egrep -c '(vmx|svm)' /proc/cpuinfo"
        },
        {
          title: "Proxmox VE ISO herunterladen",
          content: `Laden Sie die neueste Proxmox VE ISO-Datei von der offiziellen Website herunter:

1. Besuchen Sie https://www.proxmox.com/de/downloads
2. Wählen Sie "Proxmox VE" aus
3. Laden Sie die ISO-Datei herunter
4. Überprüfen Sie die Checksumme zur Sicherheit

Erstellen Sie einen bootfähigen USB-Stick oder brennen Sie die ISO auf eine DVD.`
        },
        {
          title: "Installation von Proxmox VE",
          content: `Starten Sie von dem erstellten Installationsmedium und folgen Sie diesen Schritten:

1. Wählen Sie "Install Proxmox VE" aus dem Boot-Menü
2. Akzeptieren Sie die Lizenzvereinbarung
3. Wählen Sie die Zielfestplatte aus
4. Konfigurieren Sie die Länder- und Zeitzoneneinstellungen
5. Legen Sie ein sicheres Root-Passwort fest
6. Konfigurieren Sie die Netzwerkeinstellungen:
   - IP-Adresse (statisch empfohlen)
   - Netzmaske
   - Gateway
   - DNS-Server
7. Starten Sie die Installation

Die Installation dauert etwa 10-15 Minuten.`
        },
        {
          title: "Erste Anmeldung und Grundkonfiguration",
          content: `Nach der Installation können Sie sich über das Web-Interface anmelden:

1. Öffnen Sie einen Webbrowser
2. Navigieren Sie zu: https://[IP-ADRESSE]:8006
3. Melden Sie sich mit folgenden Daten an:
   - Benutzername: root
   - Passwort: [Ihr gewähltes Passwort]

Führen Sie nach der ersten Anmeldung folgende Schritte durch:

• System-Updates installieren
• Backup-Repository konfigurieren
• Firewall-Regeln anpassen
• SSL-Zertifikat einrichten (optional)`
        },
        {
          title: "Repository-Konfiguration",
          content: `Standardmäßig ist das Enterprise-Repository aktiviert, welches ein Abonnement erfordert. Für den kostenlosen Einsatz konfigurieren Sie das No-Subscription Repository:

1. Deaktivieren Sie das Enterprise Repository:`,
          path: "echo '# deb https://enterprise.proxmox.com/debian/pve bullseye pve-enterprise' > /etc/apt/sources.list.d/pve-enterprise.list"
        },
        {
          title: "No-Subscription Repository hinzufügen",
          content: `2. Fügen Sie das No-Subscription Repository hinzu:`,
          path: "echo 'deb http://download.proxmox.com/debian/pve bullseye pve-no-subscription' > /etc/apt/sources.list.d/pve-no-subscription.list"
        },
        {
          title: "System aktualisieren",
          content: `3. Aktualisieren Sie die Paketlisten und das System:`,
          path: "apt update && apt upgrade -y"
        },
        {
          title: "Speicher-Konfiguration",
          content: `Proxmox unterstützt verschiedene Speicher-Backends. Für den Einstieg können Sie lokalen Speicher verwenden:

1. Navigieren Sie zu "Datacenter" → "Storage"
2. Der lokale Speicher ist bereits konfiguriert
3. Für zusätzlichen Speicher klicken Sie auf "Add" und wählen Sie den gewünschten Typ:
   - Directory (für lokale Verzeichnisse)
   - LVM (für LVM-Volumes)
   - ZFS (für ZFS-Pools)
   - NFS/CIFS (für Netzwerkspeicher)

Empfohlene Speicher-Aufteilung:
• System: 32-64 GB
• VM-Images: Restlicher Speicher
• Backups: Separates Laufwerk oder Netzwerkspeicher`
        },
        {
          title: "Erste virtuelle Maschine erstellen",
          content: `Erstellen Sie Ihre erste VM:

1. Klicken Sie auf "Create VM"
2. Konfigurieren Sie die VM:
   - Name und VM-ID vergeben
   - ISO-Image auswählen (vorher hochladen unter "local" → "ISO Images")
   - Betriebssystem-Typ wählen
   - System-Einstellungen (BIOS/UEFI, Machine Type)
   - Festplatte konfigurieren (Größe, Format)
   - CPU-Kerne zuweisen
   - RAM zuweisen
   - Netzwerk-Interface konfigurieren
3. Starten Sie die VM und installieren Sie das Betriebssystem

Tipp: Verwenden Sie VirtIO-Treiber für bessere Performance.`
        },
        {
          title: "Backup-Konfiguration",
          content: `Richten Sie automatische Backups ein:

1. Navigieren Sie zu "Datacenter" → "Backup"
2. Klicken Sie auf "Add" um einen Backup-Job zu erstellen
3. Konfigurieren Sie:
   - Backup-Zeitplan (täglich, wöchentlich)
   - Zu sichernde VMs auswählen
   - Backup-Speicherort
   - Aufbewahrungsrichtlinie
   - Komprimierung und Verschlüsselung

Backup-Kommando für manuelle Sicherung:`,
          path: "vzdump [VM-ID] --storage [STORAGE-NAME] --compress gzip"
        },
        {
          title: "Netzwerk-Konfiguration",
          content: `Proxmox erstellt standardmäßig eine Linux Bridge (vmbr0). Für erweiterte Netzwerk-Setups:

1. Navigieren Sie zu "System" → "Network"
2. Verfügbare Optionen:
   - Linux Bridge (Standard, für einfache Setups)
   - Open vSwitch (für erweiterte Features)
   - VLAN-Konfiguration
   - Bonding für Redundanz

Beispiel für VLAN-Konfiguration:
- Erstellen Sie eine neue Bridge
- Aktivieren Sie "VLAN aware"
- Konfigurieren Sie VLANs in den VM-Netzwerk-Einstellungen`
        },
        {
          title: "Firewall-Konfiguration",
          content: `Aktivieren und konfigurieren Sie die Proxmox Firewall:

1. Navigieren Sie zu "Datacenter" → "Firewall"
2. Aktivieren Sie die Firewall auf Datacenter-Ebene
3. Konfigurieren Sie Regeln:
   - Eingehende Verbindungen (SSH, Web-Interface)
   - Ausgehende Verbindungen
   - VM-spezifische Regeln

Wichtige Standard-Ports:
• 8006: Web-Interface (HTTPS)
• 22: SSH
• 5900-5999: VNC-Konsolen
• 3128: SPICE-Proxy

Firewall auf Node-Ebene aktivieren:`,
          path: "echo 'ENABLE=1' >> /etc/default/pve-firewall"
        },
        {
          title: "Monitoring und Wartung",
          content: `Überwachen Sie Ihr Proxmox-System regelmäßig:

Dashboard-Übersicht:
• CPU-Auslastung
• RAM-Verbrauch
• Festplatten-I/O
• Netzwerk-Traffic
• VM-Status

Wartungsaufgaben:
• Regelmäßige Updates installieren
• Log-Dateien überwachen
• Backup-Integrität prüfen
• Performance-Metriken analysieren

Log-Dateien überprüfen:`,
          path: "journalctl -u pve-cluster -f"
        },
        {
          title: "Troubleshooting",
          content: `Häufige Probleme und Lösungen:

Problem: Web-Interface nicht erreichbar
Lösung: Firewall und Netzwerk-Konfiguration prüfen

Problem: VM startet nicht
Lösung: Hardware-Konfiguration und Logs überprüfen

Problem: Schlechte Performance
Lösung: VirtIO-Treiber installieren, CPU/RAM anpassen

Nützliche Befehle für die Fehlersuche:`,
          path: `pveversion -v  # Proxmox-Version anzeigen
qm list  # Alle VMs auflisten
pct list  # Alle Container auflisten
pvesm status  # Storage-Status prüfen`
        }
      ]
    }

    try {
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proxmoxGuide)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ Proxmox Guide erfolgreich erstellt! Slug: ${data.guide.slug}`)
      } else {
        setMessage(`❌ Fehler: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Netzwerkfehler: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Guide erstellen</h1>
          
          <div className="space-y-4">
            <button
              onClick={createProxmoxGuide}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Erstelle Proxmox Guide...' : 'Proxmox VE Guide erstellen'}
            </button>

            {message && (
              <div className={`p-4 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold text-gray-900 mb-2">Hinweise:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Der Proxmox Guide enthält 15 Abschnitte mit detaillierten Anleitungen</li>
              <li>• Pfade werden automatisch nach dem Text angezeigt</li>
              <li>• Der Guide wird in Vercel Blob Storage gespeichert</li>
              <li>• Nach der Erstellung ist der Guide unter /guides/proxmox-ve-installation-konfiguration verfügbar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}