export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="flex flex-col items-center justify-center min-h-[70vh] sm:min-h-[80vh] space-y-8 sm:space-y-12">
        {/* Logo Section - Larger and Separate */}
        <div className="text-center">
          <img 
            src="/matsuda-béla-weiß.png" 
            alt="Matsuda Béla Logo" 
            className="h-40 sm:h-48 md:h-56 lg:h-64 w-auto mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
        
        {/* Welcome Text Section */}
        <div className="text-center max-w-4xl w-full">
          <div className="glass-card p-6 sm:p-8 md:p-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Willkommen
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}