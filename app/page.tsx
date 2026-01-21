import Link from 'next/link';

// Sample coloring pages data
const coloringPages = [
  { id: 'butterfly', title: 'Butterfly', src: '/lineart/butterfly.svg' },
  { id: 'flower', title: 'Flower', src: '/lineart/flower.svg' },
  { id: 'house', title: 'Cozy House', src: '/lineart/house.svg' },
  { id: 'fish', title: 'Tropical Fish', src: '/lineart/fish.svg' },
  { id: 'star', title: 'Happy Star', src: '/lineart/star.svg' },
  { id: 'unicorn', title: 'Magical Unicorn', src: '/lineart/unicorn.svg' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-rose-400/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm 
                          px-4 py-2 rounded-full text-amber-700 text-sm font-medium mb-6 
                          shadow-lg shadow-amber-200/50">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Digital Coloring Experience
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 
                         bg-clip-text text-transparent mb-6">
            Color Your World
          </h1>
          
          <p className="text-lg sm:text-xl text-amber-800/80 max-w-2xl mx-auto mb-8">
            Choose from our collection of beautiful line art, or upload your own photos 
            to transform into coloring pages. Color, create, and export your masterpieces!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="#gallery"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 
                         text-white px-8 py-3 rounded-full font-semibold shadow-lg 
                         shadow-amber-300/50 hover:shadow-xl hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Browse Gallery
            </Link>
            <Link 
              href="/color/butterfly"
              className="inline-flex items-center gap-2 bg-white text-amber-700 
                         px-8 py-3 rounded-full font-semibold shadow-lg 
                         hover:shadow-xl hover:scale-105 transition-all border border-amber-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Start Coloring
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-amber-300/30 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-rose-300/30 rounded-full blur-xl" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-orange-300/30 rounded-full blur-xl" />
      </header>

      {/* Gallery Section */}
      <main id="gallery" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-amber-900 mb-4">
            Choose Your Canvas
          </h2>
          <p className="text-amber-700/80">
            Select a coloring page to begin, or upload your own photo to convert
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coloringPages.map((page) => (
            <Link
              key={page.id}
              href={`/color/${page.id}`}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg 
                         hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-square p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                <img
                  src={page.src}
                  alt={page.title}
                  className="w-full h-full object-contain transition-transform 
                             duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white 
                              transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-semibold text-lg">{page.title}</h3>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Click to color
                </p>
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-amber-900">{page.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <section className="mt-24 grid sm:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-400 
                            rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Upload & Convert</h3>
            <p className="text-amber-700/70">
              Transform any photo into line art with adjustable settings
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-400 to-pink-400 
                            rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Color with Ease</h3>
            <p className="text-amber-700/70">
              Intuitive brush tools with pressure sensitivity support
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-indigo-400 
                            rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Export as PDF</h3>
            <p className="text-amber-700/70">
              Download your artwork as a high-quality PDF to print or share
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-amber-700/60">
          <p>Made with creativity and code. Works on desktop and mobile.</p>
        </div>
      </footer>
    </div>
  );
}
