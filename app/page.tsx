export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-4xl">
          <div className="glass-card p-12 mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Willkommen
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Matsuda Béla Website - Moderne Relais Steuerung mit elegantem Design
            </p>
            <div className="flex justify-center space-x-4">
              <button className="glass-button px-8 py-3 rounded-full text-white font-medium transition-all duration-300 hover:shadow-lg">
                Mehr erfahren
              </button>
              <button className="glass-button px-8 py-3 rounded-full text-white font-medium transition-all duration-300 hover:shadow-lg">
                Kontakt
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="glass-card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Relais Steuerung</h3>
              <p className="text-white/70">Moderne und sichere Steuerung Ihrer Relais-Systeme</p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sicherheit</h3>
              <p className="text-white/70">Höchste Sicherheitsstandards für Ihre Anwendungen</p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Innovation</h3>
              <p className="text-white/70">Modernste Technologien für optimale Performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}