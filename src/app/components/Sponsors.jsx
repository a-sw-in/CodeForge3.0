'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import data from '@/data/hackathon.json';

const SPRING = { type: 'spring', stiffness: 300, damping: 24 };
const { sponsors: sponsorsData } = data;

function BlinkDot({ color }) {
  return (
    <motion.div className="w-2 h-2 rounded-full shrink-0"
      style={{ background: color }}
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 1.2, repeat: Infinity }} />
  );
}

export default function Sponsors() {
  const reduce = useReducedMotion();

  if (!sponsorsData || sponsorsData.length === 0) {
    return null;
  }

  return (
    <section id="sponsors-section" className="relative py-16 md:py-20 px-4 md:px-6 overflow-hidden" style={{ background: '#0055FF' }}>
      {/* Diagonal texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 8px)' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header window */}
        <motion.div className="mb-8"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={SPRING} viewport={{ once: true }}>
          <div style={{ border: '3px solid #CCFF00', background: '#FFFFFF', boxShadow: '6px 6px 0px #CCFF00' }}>
            <div className="flex items-center gap-2 px-3 py-2"
              style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
              <BlinkDot color="#FF44AA" />
              <span className="flex-1 font-black text-xs uppercase tracking-widest truncate"
                style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>
                Sponsors Gallery
              </span>
              <div className="flex gap-1 shrink-0">
                {['—', '□', '✕'].map(c => (
                  <div key={c} className="w-4 h-4 bg-white items-center justify-center text-xs font-black hidden sm:flex"
                    style={{ border: '1.5px solid #001A6E', color: '#001A6E' }}>{c}</div>
                ))}
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase leading-none"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '-0.01em' }}>
                OUR SPONSORS
              </h2>
              <p className="font-black text-xs uppercase mt-1" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#64748B' }}>
                Proudly supported by our partners
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sponsors Grid */}
        <div className="relative flex justify-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
          {sponsorsData.map((sponsor, idx) => {
            const colors = ['#CCFF00', '#00CCFF', '#FF44AA', '#CCFF00', '#00CCFF', '#FF44AA'];
            const color = colors[idx % colors.length];
            const textColor = color === '#FF44AA' ? '#FFFFFF' : '#001A6E';

            return (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: idx * 0.05 }} viewport={{ once: true, margin: '-10px' }}>
                <div style={{
                  border: '3px solid #001A6E',
                  background: '#FFFFFF',
                  boxShadow: '4px 4px 0px rgba(0,26,110,0.2)',
                  transition: 'all 0.2s ease',
                }}
                  className="hover:shadow-lg p-6 flex flex-col items-center justify-center min-h-[240px] w-full max-w-sm"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `4px 4px 0px ${color}`;
                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,26,110,0.2)';
                    e.currentTarget.style.transform = 'translate(0, 0)';
                  }}>
                  {/* Logo */}
                  <div className="relative w-full h-32 mb-4 flex items-center justify-center">
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      width={150}
                      height={150}
                      style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                      priority={idx < 3}
                    />
                  </div>

                  {/* Sponsor info */}
                  <h3 className="text-sm font-black text-center uppercase mb-2"
                    style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                    {sponsor.name}
                  </h3>

                  {sponsor.category && (
                    <div
                      className="px-2 py-1 text-xs font-black uppercase text-center mb-2"
                      style={{
                        background: color,
                        color: textColor,
                        border: '2px solid #001A6E',
                        fontFamily: 'var(--y2k-font-mono)',
                      }}>
                      {sponsor.category}
                    </div>
                  )}

                  {sponsor.caption && (
                    <p className="text-xs text-center italic"
                      style={{
                        color: '#64748B',
                        fontFamily: 'var(--y2k-font-ui)',
                      }}>
                      {sponsor.caption}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.div className="mt-8 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <BlinkDot color="#CCFF00" />
          <p className="text-xs font-black uppercase text-center" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#CCFF00' }}>
            Interested in sponsorship? Contact us at {data.event.email}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
