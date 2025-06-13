export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-4xl">
          <div className="glass-card p-12">
            <div className="mb-8">
              <img 
                src="/matsuda-béla-weiß.png" 
                alt="Matsuda Béla Logo" 
                className="h-32 w-auto mx-auto mb-8 opacity-90"
              />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Willkommen
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}