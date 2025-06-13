'use client'

import Link from 'next/link'
import { getGuideBySlug } from '@/data/guides'

export default function ProxmoxGuidePage() {
  const guide = getGuideBySlug('proxmox-guide')
  
  if (!guide) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Guide nicht gefunden</h1>
          <Link href="/" className="glass-button text-white px-6 py-3 rounded-lg">
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    )
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Anfänger':
        return 'text-green-400 bg-green-400/20 border-green-400/30'
      case 'Fortgeschritten':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'Experte':
        return 'text-red-400 bg-red-400/20 border-red-400/30'
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zu den Guides
          </Link>
        </div>

        {/* Guide Header */}
        <div className="glass-card p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
            <div className="flex-1 mb-4 lg:mb-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-400/30">
                  {guide.category}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full border ${getDifficultyColor(guide.difficulty)}`}>
                  {guide.difficulty}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {guide.title}
              </h1>
              
              <p className="text-white/80 text-lg mb-6">
                {guide.description}
              </p>
            </div>
          </div>

          {/* Guide Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-black/20 rounded-lg border border-white/10">
            {/* Author */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-2">Autor</h3>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">
                    {guide.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{guide.author}</p>
                  {guide.authorRole && (
                    <p className="text-white/60 text-sm">{guide.authorRole}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reading Time */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-2">Lesezeit</h3>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white">{guide.readTime}</span>
              </div>
            </div>

            {/* Published Date */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-2">Veröffentlicht</h3>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white">
                  {new Date(guide.publishedAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>

            {/* Last Updated */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-2">Aktualisiert</h3>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-white">
                  {new Date(guide.updatedAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          </div>

          {/* Operating Systems */}
          <div className="mt-6">
            <h3 className="text-white/80 text-sm font-medium mb-3">Unterstützte Betriebssysteme</h3>
            <div className="flex flex-wrap gap-2">
              {guide.operatingSystem.map((os, index) => (
                <span 
                  key={index}
                  className="px-3 py-2 bg-purple-500/20 text-purple-300 text-sm rounded-lg border border-purple-400/30 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  {os}
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6">
            <h3 className="text-white/80 text-sm font-medium mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {guide.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full hover:bg-white/20 transition-colors duration-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Guide Content */}
        <div className="glass-card p-6 sm:p-8 md:p-10">
          
          <div className="space-y-6 sm:space-y-8 text-white/90 text-sm sm:text-base leading-relaxed">
            <p>
              Proxmox Virtual Environment (Proxmox VE) ist eine leistungsfähige Open-Source-Virtualisierungsplattform. 
              In diesem Guide erfährst du, wie du Proxmox VE auf einem Hetzner VPS Server installierst und ein internes 
              LAN-Netzwerk für deine virtuellen Maschinen einrichtest.
            </p>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Installation von Proxmox VE</h2>
              <p className="mb-4">Es gibt mehrere Möglichkeiten, Proxmox VE auf einem Hetzner Server zu installieren:</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white/95 mb-2">1. Über installimage im Rescue-System (nur für dedizierte Server):</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Server ins Rescue-System booten</li>
                    <li>installimage ausführen</li>
                    <li>Unter „Other [NO SUPPORT]" die Option für Proxmox VE wählen</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white/95 mb-2">2. Manuelle Installation auf Debian:</h3>
                  <p className="mb-2">Debian 12 (Bookworm) über das Hetzner-Installationssystem installieren</p>
                  <p className="mb-2">Dann folgende Befehle ausführen:</p>
                  <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-green-300">
{`apt update
apt install proxmox-ve
reboot`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white/95 mb-2">3. ISO-Installation (für VPS):</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Proxmox VE ISO-Image herunterladen</li>
                    <li>KVM-Konsole von Hetzner verwenden, um vom ISO zu booten und die Installation durchzuführen</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Netzwerkkonfiguration</h2>
              <p className="mb-4">
                Nach der Installation von Proxmox VE müssen die Netzwerkschnittstellen konfiguriert werden. 
                Bearbeite dazu die Datei <code className="bg-black/30 px-2 py-1 rounded text-blue-300">/etc/network/interfaces</code>:
              </p>
              
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-green-300">
{`auto lo
iface lo inet loopback

auto [Name der physischen Netzwerkkarte]
iface [Name der physischen Netzwerkkarte] inet manual

auto vmbr0
iface vmbr0 inet static
    address [Ihre öffentliche IP]/[CIDR-Notation]
    gateway [Ihr Gateway]
    bridge-ports [Name der physischen Netzwerkkarte]
    bridge-stp off
    bridge-fd 0

auto vmbr1
iface vmbr1 inet static
    address 192.168.100.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0`}
                </pre>
              </div>
              
              <p className="mt-4 text-yellow-300">
                <strong>Hinweis:</strong> Die Netmask wird in CIDR-Notation angegeben, z. B. /24 für 255.255.255.0.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">DHCP-Server einrichten</h2>
              <p className="mb-4">Für die automatische IP-Vergabe an VMs im LAN-Netzwerk installiere und konfiguriere einen DHCP-Server:</p>
              
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                <pre className="text-green-300">
{`apt update
apt install isc-dhcp-server`}
                </pre>
              </div>

              <p className="mb-2">Konfiguriere den DHCP-Server in <code className="bg-black/30 px-2 py-1 rounded text-blue-300">/etc/dhcp/dhcpd.conf</code>:</p>
              
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                <pre className="text-green-300">
{`default-lease-time 600;
max-lease-time 7200;
authoritative;

subnet 192.168.100.0 netmask 255.255.255.0 {
    range 192.168.100.10 192.168.100.50;
    option routers 192.168.100.1;
    option domain-name-servers 8.8.8.8, 8.8.4.4;
}`}
                </pre>
              </div>

              <p className="mb-2">Lege die Schnittstelle für den DHCP-Server in <code className="bg-black/30 px-2 py-1 rounded text-blue-300">/etc/default/isc-dhcp-server</code> fest:</p>
              
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                <pre className="text-green-300">
{`INTERFACESv4="vmbr1"
INTERFACESv6=""`}
                </pre>
              </div>

              <p className="mb-2">Starte den DHCP-Server neu:</p>
              
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-green-300">
{`systemctl restart isc-dhcp-server`}
                </pre>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Port-Forwarding einrichten</h2>
              <p className="mb-4">Für den Zugriff auf VMs von außen ist Port-Forwarding erforderlich. Installiere iptables:</p>
              
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                <pre className="text-green-300">
{`apt update
apt install iptables -y`}
                </pre>
              </div>

              <p className="mb-2">Beispiel für Port-Forwarding (externer Port 2222 auf internen SSH-Port 22 der VM 192.168.100.22):</p>
              
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-green-300">
{`# NAT-Regel
iptables -t nat -A PREROUTING -p tcp --dport 2222 -j DNAT --to-destination 192.168.100.22:22

# Masquerading
iptables -t nat -A POSTROUTING -p tcp -d 192.168.100.22 --dport 22 -j MASQUERADE

# Forward
iptables -A FORWARD -p tcp -d 192.168.100.22 --dport 22 -j ACCEPT`}
                </pre>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Sicherheitshinweise</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Verwende starke Passwörter oder besser noch SSH-Schlüssel für die Authentifizierung.</li>
                <li>Konfiguriere die SSH-Einstellungen der VM für erhöhte Sicherheit (z. B. Passwort-Authentifizierung deaktivieren).</li>
                <li>Erwäge die Nutzung eines VPN anstelle von direktem Port-Forwarding für sensible Umgebungen.</li>
                <li>Halte Proxmox-Host und VMs stets aktuell.</li>
              </ul>
              
              <div className="mt-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                <p className="text-blue-200">
                  <strong>Hinweis:</strong> Durch diese Konfiguration wird der SSH-Zugang zur VM über den externen Port 2222 ermöglicht, 
                  während die interne Kommunikation weiterhin über den Standard-SSH-Port 22 erfolgt.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}