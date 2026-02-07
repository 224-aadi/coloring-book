import Link from 'next/link';
import ValentineCover from '@/components/ValentineCover';

// Sample coloring pages data
const coloringPages = [
  { id: 'blank', title: 'Blank Canvas', src: null, isBlank: true },
  { id: 'butterfly', title: 'Butterfly', src: '/lineart/butterfly.svg' },
  { id: 'flower', title: 'Flower', src: '/lineart/flower.svg' },
  { id: 'house', title: 'Cozy House', src: '/lineart/house.svg' },
  { id: 'fish', title: 'Tropical Fish', src: '/lineart/fish.svg' },
  { id: 'star', title: 'Happy Star', src: '/lineart/star.svg' },
  { id: 'unicorn', title: 'Magical Unicorn', src: '/lineart/unicorn.svg' },
];

export default function Home() {
  return (
    <ValentineCover>
    <div className="min-h-screen bg-[#FEFCFD]">
      {/* Hero Section */}
      <header className="relative">
        <div className="max-w-5xl mx-auto px-5 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white 
                          px-4 py-2 rounded-[16px] text-[#EC4899] text-sm font-medium mb-8 
                          card-shadow">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Digital Coloring Experience
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-[#374151] mb-5 tracking-tight">
            Color Your World
          </h1>
          
          <p className="text-lg text-[#6B7280] max-w-xl mx-auto mb-10 leading-relaxed">
            Choose from our collection of beautiful line art, or upload your own photos 
            to transform into coloring pages.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="#gallery"
              className="inline-flex items-center gap-2 bg-[#EC4899] 
                         text-white px-7 py-3 rounded-[16px] font-semibold card-shadow
                         hover:bg-[#DB2777] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Browse Gallery
            </Link>
            <Link 
              href="/color/butterfly"
              className="inline-flex items-center gap-2 bg-white text-[#374151] 
                         px-7 py-3 rounded-[16px] font-semibold card-shadow
                         hover:bg-[#F3F4F6] transition-colors border border-[#E5E7EB]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Start Coloring
            </Link>
          </div>
        </div>
      </header>

      {/* Gallery Section */}
      <main id="gallery" className="max-w-5xl mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-[#374151] mb-3">
            Choose Your Canvas
          </h2>
          <p className="text-[#6B7280]">
            Select a coloring page to begin, or upload your own photo to convert
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coloringPages.map((page) => (
            <Link
              key={page.id}
              href={`/color/${page.id}`}
              className="group bg-white rounded-[16px] overflow-hidden card-shadow
                         hover:card-shadow-hover transition-all duration-200 hover:-translate-y-1"
            >
              <div className="aspect-square p-6 bg-[#FAFAFA] flex items-center justify-center">
                {'isBlank' in page && page.isBlank ? (
                  <div className="flex flex-col items-center gap-3 text-[#9CA3AF] group-hover:text-[#EC4899] transition-colors">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium">Free Draw</span>
                  </div>
                ) : (
                  <img
                    src={page.src!}
                    alt={page.title}
                    className="w-full h-full object-contain transition-transform 
                               duration-200 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-4 border-t border-[#F3F4F6]">
                <h3 className="font-semibold text-[#374151]">{page.title}</h3>
                <p className="text-sm text-[#6B7280] mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {'isBlank' in page && page.isBlank ? 'Start from scratch' : 'Click to color'}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <section className="mt-20 grid sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-[16px] p-6 card-shadow text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#FDF2F8] 
                            rounded-[12px] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#374151] mb-2">Upload & Convert</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Transform any photo into line art with adjustable settings
            </p>
          </div>
          
          <div className="bg-white rounded-[16px] p-6 card-shadow text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#FDF2F8] 
                            rounded-[12px] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#374151] mb-2">Color with Ease</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Intuitive brush tools with pressure sensitivity support
            </p>
          </div>
          
          <div className="bg-white rounded-[16px] p-6 card-shadow text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#FDF2F8] 
                            rounded-[12px] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#374151] mb-2">Export as PDF</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Download your artwork as a high-quality PDF to print or share
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-5 py-8 text-center text-sm text-[#6B7280]">
          <p>Made with creativity and code. Works on desktop and mobile.</p>
        </div>
      </footer>
    </div>
    </ValentineCover>
  );
}
