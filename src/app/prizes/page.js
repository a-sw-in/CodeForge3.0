'use client';

import { motion } from 'framer-motion';
import { IconTrophy, IconMedal, IconAward, IconStar } from '@tabler/icons-react';

const SPRING = { type: 'spring', stiffness: 300, damping: 24 };

const prizes = [
  {
    title: 'First Place',
    amount: '₹8,000',
    icon: IconTrophy,
    color: '#CCFF00',
    textColor: '#001A6E',
    description: 'Grand prize + Certificate + Mentorship opportunity',
  },
  {
    title: 'Second Place',
    amount: '₹5,000',
    icon: IconMedal,
    color: '#00CCFF',
    textColor: '#001A6E',
    description: 'Runner-up prize + Certificate + Goodies',
  },
  {
    title: 'Third Place',
    amount: '₹2,000',
    icon: IconAward,
    color: '#FF44AA',
    textColor: '#FFFFFF',
    description: 'Prize + Certificate + Exclusive merch',
  },
];

const bonusPrizes = [
  'Best Innovation Award',
  'Best UI/UX Design',
  'Best Social Impact',
  'Most Creative Solution',
];

export default function PrizesPage() {
  return (
    <div className="relative w-full min-h-screen" style={{ background: '#FF44AA' }}>
      {/* Diagonal texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 10px)' }} />

      {/* Back to Home Button */}
      <div className="relative z-20 pt-6 px-4 md:px-8">
        <motion.a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2 font-bold uppercase text-xs"
          style={{
            fontFamily: 'var(--y2k-font-ui)',
            background: '#FFFFFF',
            color: '#001A6E',
            border: '3px solid #001A6E',
            letterSpacing: '0.08em',
            boxShadow: '3px 3px 0px #001A6E',
          }}
          whileHover={{ x: -2, y: -2, boxShadow: '5px 5px 0px #001A6E' }}
          whileTap={{ x: 1, y: 1, boxShadow: '1px 1px 0px #001A6E' }}
        >
          ← Back to Home
        </motion.a>
      </div>

      {/* Prizes Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Header Window */}
        <motion.div className="mb-12"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={SPRING}>
          <div style={{ border: '3px solid #001A6E', background: '#FFFFFF', boxShadow: '8px 8px 0px #001A6E' }}>
            <div className="flex items-center gap-2 px-3 py-2"
              style={{ background: 'linear-gradient(90deg, #CCFF00 0%, #AADD00 100%)', borderBottom: '3px solid #001A6E' }}>
              <IconTrophy size={16} color="#001A6E" strokeWidth={3} />
              <span className="flex-1 font-black text-xs uppercase tracking-widest"
                style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>
                prizes.exe — ₹15,000 POOL
              </span>
            </div>
            <div className="px-6 py-6">
              <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-3"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '-0.02em' }}>
                WIN BIG
              </h1>
              <p className="text-sm" style={{ color: '#64748B', fontFamily: 'var(--y2k-font-ui)' }}>
                ₹15,000+ in cash prizes, certificates, and exclusive opportunities
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Prizes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {prizes.map((prize, idx) => {
            const Icon = prize.icon;
            return (
              <motion.div key={prize.title}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.1 + idx * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <div style={{
                  border: '3px solid #001A6E',
                  background: '#FFFFFF',
                  boxShadow: `5px 5px 0px ${prize.color}`,
                  height: '100%'
                }}>
                  <div className="flex items-center justify-center gap-2 px-4 py-3"
                    style={{ background: prize.color, borderBottom: '3px solid #001A6E' }}>
                    <Icon size={20} color={prize.textColor} strokeWidth={3} />
                    <span className="font-black text-sm uppercase"
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: prize.textColor }}>
                      {prize.title}
                    </span>
                  </div>
                  <div className="p-5 text-center">
                    <div className="text-5xl font-black mb-3"
                      style={{ fontFamily: 'var(--y2k-font-display)', color: prize.color, textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
                      {prize.amount}
                    </div>
                    <p className="text-xs leading-relaxed"
                      style={{ color: '#475569', fontFamily: 'var(--y2k-font-ui)' }}>
                      {prize.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bonus Prizes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.4 }}>
          <div style={{ border: '3px solid #001A6E', background: '#FFFFFF', boxShadow: '6px 6px 0px #001A6E' }}>
            <div className="flex items-center gap-3 px-4 py-3"
              style={{ background: '#0055FF', borderBottom: '3px solid #001A6E' }}>
              <IconStar size={18} color="#CCFF00" strokeWidth={3} />
              <span className="font-black text-sm uppercase text-white"
                style={{ fontFamily: 'var(--y2k-font-ui)' }}>
                Special Category Awards
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bonusPrizes.map((award, idx) => (
                  <motion.div key={award}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className="flex items-center gap-3 p-3"
                    style={{ border: '2px solid #001A6E', background: '#F0FFF4' }}>
                    <div className="w-6 h-6 flex items-center justify-center shrink-0"
                      style={{ background: '#CCFF00', border: '2px solid #001A6E' }}>
                      <IconStar size={14} color="#001A6E" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-bold"
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                      {award}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div className="mt-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}>
          <div className="text-center px-4 py-3"
            style={{ border: '3px solid #001A6E', background: '#FFFFFF', boxShadow: '4px 4px 0px #001A6E' }}>
            <p className="text-sm font-bold mb-1"
              style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
              🎁 All Participants Receive
            </p>
            <p className="text-xs"
              style={{ color: '#64748B', fontFamily: 'var(--y2k-font-ui)' }}>
              Participation Certificate · Exclusive Merch · Networking Opportunities · Mentorship Access
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
