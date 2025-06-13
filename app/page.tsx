export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-center min-h-[70vh] sm:min-h-[80vh]">
        <div className="text-center max-w-4xl w-full">
          <div className="mb-8 sm:mb-12">
            <img 
              src="/matsuda-béla-weiß.png" 
              alt="Matsuda Béla Logo" 
              className="h-32 sm:h-40 md:h-48 w-auto mx-auto opacity-90"
            />
          </div>
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