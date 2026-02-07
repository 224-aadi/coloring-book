'use client';

import { useState, useEffect } from 'react';

interface ValentineCoverProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'valentine-cover-dismissed';

export default function ValentineCover({ children }: ValentineCoverProps) {
  const [showCover, setShowCover] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      setShowCover(false);
    }
    setIsLoaded(true);
  }, []);

  const handleOpen = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowCover(false);
  };

  // Don't render anything until we've checked localStorage (prevents flash)
  if (!isLoaded) {
    return null;
  }

  if (!showCover) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#FEFCFD] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Heart icon */}
        <div className="mb-8">
          <svg 
            className="w-20 h-20 mx-auto text-[#EC4899]" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[#374151] mb-4 tracking-tight">
          Happy Valentine&apos;s Day
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-[#6B7280] mb-10 leading-relaxed">
          A little something made with love.<br />
          Color it, make it yours.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 bg-[#EC4899] text-white 
                     px-8 py-4 rounded-[16px] font-semibold text-lg
                     hover:bg-[#DB2777] transition-colors card-shadow"
        >
          Open Today&apos;s Page
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Small footer text */}
        <p className="mt-8 text-sm text-[#9CA3AF]">
          Made for you with care
        </p>
      </div>
    </div>
  );
}
