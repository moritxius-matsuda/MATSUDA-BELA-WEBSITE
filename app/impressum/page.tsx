export default function ImpressumPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Impressum */}
          <div className="glass-card p-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Impressum
            </h1>
            
            <div className="space-y-6 text-white/90">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Anbieterkennzeichnung nach § 5 DDG</h2>
                <p>Andreas Meier<br />
                Am Weidengraben 65<br />
                54296 Trier<br />
                Deutschland</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Verantwortlich gemäß § 18 MStV</h2>
                <p>Andreas Meier</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Betrieben durch</h2>
                <p>Moritz Béla Meier, vertreten durch seinen gesetzlichen Vertreter Andreas Meier</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Kontakt</h2>
                <p>E-Mail: behoerde@moritxius.de<br />
                Telefon: +49 651 6860593</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
                <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Hinweis zur Online-Streitbeilegung gemäß Art. 14 Abs. 1 ODR-VO</h2>
                <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a> finden.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Urheberrechtlicher Hinweis</h2>
                <p>Die Inhalte dieser Website sind urheberrechtlich geschützt. Jegliche Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Haftungsausschluss</h2>
                <p>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Änderungen</h2>
                <p>Wir behalten uns vor, dieses Impressum jederzeit zu ändern. Es gilt stets die zum Zeitpunkt des Besuchs unserer Website aktuelle Fassung.</p>
                <p className="text-sm text-white/70 mt-2">Stand: 04.05.2024</p>
              </div>
            </div>
          </div>

          {/* Datenschutzerklärung */}
          <div className="glass-card p-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Datenschutzerklärung
            </h1>
            
            <div className="space-y-6 text-white/90">
              <p>Diese Datenschutzerklärung erläutert Art, Umfang und Zweck der Erhebung und Verarbeitung personenbezogener Daten auf dieser Website. Verantwortlich ist der in Ihrem Impressum genannte Betreiber. Technische Umsetzung der Authentifizierung erfolgt über Clerk, das Hosting über Vercel. Nutzer können sich über Clerk registrieren, wofür Name, E‑Mail, Passwort und ggf. Google‑OAuth‑Daten verarbeitet werden. Die Erhebung von Server‑Logdaten dient der Sicherheit und Stabilität des Angebots. Betroffene Personen haben umfangreiche Rechte nach der DSGVO.</p>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">1. Verantwortlicher</h2>
                <p>Name/Firma: Moritz Béla Meier, vertreten durch seinen gesetzlichen Vertreter Andreas Meier<br />
                Anschrift: Am Weidengraben 65, 54296 Trier, Deutschland<br />
                Kontakt: E‑Mail: behoerde@moritxius.de, Telefon: +49 651 6860593</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">2. Datenschutzbeauftragter</h2>
                <p>Wir haben keinen Datenschutzbeauftragten benannt, da wir nicht gesetzlich dazu verpflichtet sind.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">3. Erhobene Daten und Verarbeitungszwecke</h2>
                
                <div className="ml-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-medium text-white/95 mb-1">3.1 Registrierung und Nutzerverwaltung via Clerk</h3>
                    <p>Datenarten: Name, E‑Mail-Adresse, Passwort sowie Google‑OAuth-Daten und technische Metadaten.<br />
                    Zweck: Authentifizierung und Kontoverwaltung.<br />
                    Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white/95 mb-1">3.2 Hosting und Server-Logs via Vercel</h3>
                    <p>Datenarten: Server-Logfiles (IP-Adresse, Zugriffszeit, Browsertyp o. Ä.).<br />
                    Zweck: Betriebssicherheit, Performance und Analyse zur Optimierung.<br />
                    Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white/95 mb-1">3.3 Cookies und Tracking</h3>
                    <p>Session-Cookies: Technisch erforderlich, um Nutzer-Sessions aufrechtzuerhalten. Analyse-Cookies oder Tracking sind nicht in Verwendung.</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">4. Datenweitergabe an Dritte</h2>
                <p>Clerk, Inc.: Sub‑Auftragsverarbeiter für Authentifizierungsdienste.<br />
                Vercel, Inc.: Hosting-Provider.<br />
                Google LLC: Im Rahmen der OAuth‑Anbindung.<br />
                Übermittlungen in Drittländer nur mit geeigneten Garantien (z. B. Standardvertragsklauseln).</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">5. Aufbewahrungsdauer</h2>
                <p>Registrierungsdaten: Bis zur Kontolöschung oder Widerruf, höchstens 3 Jahre nach letzter Anmeldung.<br />
                Server-Logs: Automatisch nach 30 Tagen gelöscht (länger bei Sicherheitsvorfällen).</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">6. Betroffenenrechte</h2>
                <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit, Widerspruch und Widerruf erteilter Einwilligungen sowie das Beschwerderecht bei einer Aufsichtsbehörde.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">7. Sicherheit</h2>
                <p>Es werden technische und organisatorische Maßnahmen wie TLS‑Verschlüsselung, Firewalls und Zugangskontrollen eingesetzt. Clerk und Vercel verfügen über eigene, regelmäßig geprüfte Sicherheitskonzepte.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-2">8. Aktualität und Änderungen</h2>
                <p>Diese Datenschutzerklärung gilt ab dem 6. Mai 2025 und kann bei Bedarf aktualisiert werden. Änderungen werden auf dieser Seite veröffentlicht.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}