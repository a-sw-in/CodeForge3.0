'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SponsorsCarousel() {
  const [sponsorImages, setSponsorImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load 3 sponsor images
    const sponsors = [
      { id: 1, src: '/sponsors/sponsor1.jpeg', name: 'Sponsor 1' },
      { id: 2, src: '/sponsors/sponsor2.jpeg', name: 'Sponsor 2' },
      { id: 3, src: '/sponsors/sponsor3.png', name: 'Sponsor 3' },
    ];
    setSponsorImages(sponsors);
    setLoading(false);
  }, []);

  if (loading || sponsorImages.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="w-full mt-12 md:mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      {/* Section Title */}
      <div className="text-center mt-[18vh] mb-8">
        <p
          className="text-sm md:text-base font-bold uppercase tracking-widest"
          style={{
            color: '#CCFF00',
            textShadow: '2px 2px 0px rgba(0, 26, 110, 0.5)',
          }}
        >
           Powered By Our Sponsors 
        </p>
      </div>

      {/* Sponsors Grid */}
      <div className="flex justify-center items-center mx-auto w-full">
        <div className="grid grid-cols-3 gap-4 px-4 w-full max-w-5xl justify-items-center">
          {sponsorImages.map((sponsor, index) => (
            <motion.div
            key={sponsor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
          >
            <div
              className="relative rounded-xl border-3 overflow-hidden group cursor-pointer bg-black flex items-center justify-center"
              style={{
                borderColor: '#CCFF00',
                boxShadow: '4px 4px 0px rgba(0, 26, 110, 0.3)',
                aspectRatio: '4 / 3',
                maxHeight: '120px',
              }}
            >
              {/* Sponsor Image */}
              <motion.img
                src={sponsor.src}
                alt={sponsor.name}
                className="w-full h-full object-contain p-2"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              {/* Overlay on Hover */}
              <motion.div
                className="absolute inset-0 bg-black opacity-0 transition-all duration-300 flex items-center justify-center"
                initial={{ opacity: 0 }}
              >
                <p
                  className="text-white font-bold text-sm"
                  style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)' }}
                >
                  {sponsor.name}
                </p>
              </motion.div>
            </div>
          </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
