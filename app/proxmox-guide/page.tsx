export default function ProxmoxGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">
            Installation von Proxmox VE auf einem Hetzner VPS Server mit LAN-Netzwerk
          </h1>
          
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