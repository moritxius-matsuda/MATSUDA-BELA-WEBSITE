'use client'

interface RelaisCardProps {
  relaisNumber: number
  isOpen: boolean
  onToggle: (relaisNumber: number, action: 'open' | 'close') => Promise<void>
}

export default function RelaisCard({ relaisNumber, isOpen, onToggle }: RelaisCardProps) {
  const handleToggle = async () => {
    const action = isOpen ? 'close' : 'open'
    await onToggle(relaisNumber, action)
  }

  return (
    <div className={`p-4 hover:scale-105 transition-all duration-300 backdrop-filter backdrop-blur-20 border border-white/20 rounded-2xl ${
      isOpen 
        ? 'bg-green-500/20 shadow-green-400/20 border-green-400/30' 
        : 'bg-red-500/20 shadow-red-400/20 border-red-400/30'
    } shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">
          R{relaisNumber}
        </h3>
        <div className={`w-4 h-4 rounded-full shadow-lg animate-pulse ${
          isOpen 
            ? 'bg-green-400 shadow-green-400/50' 
            : 'bg-red-400 shadow-red-400/50'
        }`}></div>
      </div>
      
      <div className="mb-4">
        <div className="text-center">
          <span className={`text-lg font-bold ${
            isOpen 
              ? 'text-green-200' 
              : 'text-red-200'
          }`}>
            {isOpen ? 'OFFEN' : 'GESCHLOSSEN'}
          </span>
        </div>
      </div>

      <button
        onClick={handleToggle}
        className={`w-full py-3 px-4 rounded-full text-sm font-medium transition-all duration-300 glass-button ${
          isOpen
            ? 'text-red-200 hover:text-red-100 hover:shadow-red-400/30'
            : 'text-green-200 hover:text-green-100 hover:shadow-green-400/30'
        }`}
      >
        {isOpen ? 'SCHLIESSEN' : 'ÖFFNEN'}
      </button>
    </div>
  )
}