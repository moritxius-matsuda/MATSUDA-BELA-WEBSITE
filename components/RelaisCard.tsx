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
    <div className="glass-card p-4 hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">
          R{relaisNumber}
        </h3>
        <div className={`w-3 h-3 rounded-full shadow-lg ${
          isOpen 
            ? 'bg-green-400 shadow-green-400/50' 
            : 'bg-red-400 shadow-red-400/50'
        }`}></div>
      </div>
      
      <div className="mb-4">
        <div className="text-center">
          <span className={`text-sm font-bold ${
            isOpen 
              ? 'text-green-300' 
              : 'text-red-300'
          }`}>
            {isOpen ? 'AKTIV' : 'INAKTIV'}
          </span>
        </div>
      </div>

      <button
        onClick={handleToggle}
        className={`w-full py-3 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
          isOpen
            ? 'glass-button text-red-300 hover:text-red-200 hover:shadow-red-400/20'
            : 'glass-button text-green-300 hover:text-green-200 hover:shadow-green-400/20'
        }`}
      >
        {isOpen ? 'AUSSCHALTEN' : 'EINSCHALTEN'}
      </button>
    </div>
  )
}