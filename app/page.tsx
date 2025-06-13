export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-center min-h-[70vh] sm:min-h-[80vh]">
        {/* Logo Section - Responsive sizing */}
        <div className="text-center">
          <img 
            src="/matsuda-béla-weiß.png" 
            alt="Matsuda Béla Logo" 
            className="w-64 h-auto sm:w-80 md:w-96 lg:w-[28rem] xl:w-[32rem] mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </div>
    </div>
  )
}