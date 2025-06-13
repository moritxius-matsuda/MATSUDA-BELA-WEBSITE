'use client'

interface RelaisCardProps {
  relaisNumber: number
  isOpen: boolean
  onToggle: (relaisNumber: number, action: 'open' | 'close') => Promise<void>
  loading: boolean
}

export default function RelaisCard({ relaisNumber, isOpen, onToggle, loading }: RelaisCardProps) {
  const handleToggle = async () => {
    const action = isOpen ? 'close' : 'open'
    await onToggle(relaisNumber, action)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">
          R{relaisNumber}
        </h3>
        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      
      <div className="mb-2">
        <div className="text-center">
          <span className={`text-xs font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
            {isOpen ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-full py-1.5 px-2 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
            ...
          </div>
        ) : (
          <>
            {isOpen ? 'AUS' : 'EIN'}
          </>
        )}
      </button>
    </div>
  )
}