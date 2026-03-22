'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import WebGL component to avoid SSR issues
const WebGLBreakAnimation = dynamic(
  () => import('./WebGLBreakAnimation'),
  { ssr: false }
);

// Commercial taglines - famous brand slogans
const commercialTaglines = [
  {
    mainText: "TAKE A BREAK",
    subText: "FEEL THE ELEGANCE",
    emoji: "🍫",
  },
  {
    mainText: "REFRESH YOURSELF",
    subText: "WHO DOES'NT LOVE CUTLET?",
    emoji: "🥤",
  },
  {
    mainText: "STAY ENERGIZED",
    subText: "ENERGY DRIVE",
    emoji: "",
  }
];

export default function BreakCommercial({ isVisible }) {
  const [sponsorImages, setSponsorImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showWebGL, setShowWebGL] = useState(false);

  useEffect(() => {
    const sponsors = [
      { id: 1, src: '/sponsors/sponsor1.jpeg', name: 'Sponsor 1' },
      { id: 2, src: '/sponsors/sponsor2.jpeg', name: 'Sponsor 2' },
      { id: 3, src: '/sponsors/sponsor3.png', name: 'Sponsor 3' },
    ];
    setSponsorImages(sponsors);
  }, []);

  useEffect(() => {
    setShowWebGL(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || sponsorImages.length === 0) return;

    // Rotate sponsors every 6 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsorImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isVisible, sponsorImages.length]);

  const currentSponsor = sponsorImages[currentIndex];
  const currentTagline = commercialTaglines[currentIndex % commercialTaglines.length];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0055FF 0%, #001A6E 50%, #0055FF 100%)',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: '100vh',
            maxWidth: '100vw',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* WebGL Animated Background */}
          {showWebGL && <WebGLBreakAnimation />}

          {/* Semi-transparent overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,85,255,0.5) 0%, rgba(0,26,110,0.85) 100%)',
              zIndex: 5,
            }}
          />

          {/* Main Commercial Container */}
          <motion.div
            className="relative z-10 w-full mx-4 pointer-events-auto"
            style={{ maxWidth: '426px' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12, duration: 0.8 }}
          >
            <div
              className="rounded-2xl border-3 p-7 md:p-8 overflow-hidden"
              style={{
                borderColor: '#CCFF00',
                background: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0px 20px 60px rgba(0, 26, 110, 0.8), inset 0px 0px 30px rgba(204,255,0,0.15)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Commercial Header */}
              <motion.div
                className="text-center mb-7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div
                  className="inline-block mb-3 px-4 py-1 rounded-full text-xs font-black tracking-wider"
                  style={{
                    background: '#CCFF00',
                    color: '#001A6E',
                    fontSize: '11px',
                  }}
                >
                  BREAK
                </div>

                <motion.h1
                  className="text-2xl md:text-4xl font-black uppercase mb-2"
                  style={{
                    fontFamily: 'var(--y2k-font-display)',
                    color: '#CCFF00',
                    textShadow: '4px 4px 0px rgba(0, 26, 110, 0.8)',
                    letterSpacing: '0.08em',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
                >
                  {currentTagline.mainText}
                </motion.h1>


              </motion.div>

              {/* Sponsor Card */}
              {currentSponsor && (
                <motion.div
                  key={currentSponsor.id}
                  className="relative mb-7 rounded-lg overflow-hidden border-2"
                  style={{
                    borderColor: '#CCFF00',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
                >
                  {/* Sponsor Image */}
                  <div className="w-full bg-black overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16 / 9', maxHeight: '145px' }}>
                    <motion.img
                      src={currentSponsor.src}
                      alt={currentSponsor.name}
                      className="w-full h-full object-contain"
                      initial={{ scale: 1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />

                    {/* Scanline effect */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `repeating-linear-gradient(
                          0deg,
                          rgba(0, 0, 0, 0.1),
                          rgba(0, 0, 0, 0.1) 1px,
                          transparent 1px,
                          transparent 2px
                        )`,
                        pointerEvents: 'none',
                        opacity: 0.15,
                      }}
                    />
                  </div>

                  {/* Brand Text */}
                  <div
                    className="p-3 text-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.2), rgba(255, 215, 0, 0.1))',
                    }}
                  >
                    <p
                      className="text-base font-black uppercase tracking-wide"
                      style={{
                        color: '#CCFF00',
                        textShadow: '2px 2px 0px rgba(0, 26, 110, 0.8)',
                      }}
                    >
                      {currentTagline.subText}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* CTA Message */}
              <motion.div
                className="text-center space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeInOut' }}
              >
                <p
                  className="text-sm md:text-base font-black uppercase tracking-wider"
                  style={{
                    color: '#CCFF00',
                    textShadow: '2px 2px 0px rgba(0, 26, 110, 0.8)',
                  }}
                >
                  BREAK
                </p>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{
                    fontSize: '11px',
                    color: '#FFFFFF',
                    textShadow: '1px 1px 0px rgba(0, 26, 110, 0.7)',
                  }}
                >
                  Refresh • Recharge • Return
                </p>
              </motion.div>

              {/* Sponsor Indicator Dots */}
              <div className="flex justify-center gap-2 mt-6 mb-0">
                {sponsorImages.map((_, index) => (
                  <motion.button
                    key={index}
                    className="h-2 rounded-full transition-all duration-500 outline-none"
                    style={{
                      background: index === currentIndex ? '#CCFF00' : 'rgba(204, 255, 0, 0.3)',
                      width: index === currentIndex ? '28px' : '8px',
                    }}
                    animate={{ width: index === currentIndex ? '28px' : '8px' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to sponsor ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
