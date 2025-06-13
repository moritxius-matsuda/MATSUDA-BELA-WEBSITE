export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-4xl">
          <div className="mb-12">
            <img 
              src="/matsuda-béla-weiß.png" 
              alt="Matsuda Béla Logo" 
              className="h-48 w-auto mx-auto opacity-90"
            />
          </div>
          <div className="glass-card p-12">
            <h1 className="text-6xl font-bold text-white">
              Willkommen
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}