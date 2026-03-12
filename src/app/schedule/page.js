'use client';

import { motion } from 'framer-motion';
import ScheduleTimeline from '@/app/components/ScheduleTimeline';

/* ─── Repeating text watermark background ─── */
function Watermark() {
  const phrase = 'CODEFORGE · IEEE · UCEK · HACKATHON · ';
  const rows = 12;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex whitespace-nowrap"
          style={{ marginTop: r === 0 ? '2vh' : 0, opacity: 0.12 }}>
          <span className="text-white text-4xl md:text-5xl font-black uppercase tracking-wider shrink-0"
            style={{ fontFamily: 'var(--y2k-font-display)', lineHeight: '1.15', paddingBottom: '0.1em' }}>
            {phrase.repeat(6)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Star Burst ─── */
function StarBurst({ color = '#CCFF00', size = 140, style = {} }) {
  const pts = '50,2 59,29 81,15 70,40 97,34 79,55 100,50 79,45 97,66 70,60 81,85 59,71 50,98 41,71 19,85 30,60 3,66 21,45 0,50 21,55 3,34 30,40 19,15 41,29';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style} aria-hidden="true">
      <polygon points={pts} fill={color} />
    </svg>
  );
}

export default function SchedulePage() {
  return (
    <div className="relative w-full min-h-screen" style={{ background: '#0055FF' }}>
      {/* Watermark Background */}
      <Watermark />

      {/* Y2K Background decorations - Star Bursts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <StarBurst size={120} color="#CCFF00" style={{ position: 'absolute', top: '8%', left: '5%', opacity: 0.8 }} />
        <StarBurst size={90} color="#CCFF00" style={{ position: 'absolute', bottom: '15%', left: '10%', opacity: 0.75 }} />
        <StarBurst size={160} color="#CCFF00" style={{ position: 'absolute', top: '6%', right: '4%', opacity: 0.9 }} />
        <StarBurst size={100} color="#CCFF00" style={{ position: 'absolute', bottom: '10%', right: '8%', opacity: 0.7 }} />
      </div>

      {/* Back to Home Button */}
      <div className="relative z-20 pt-6 px-4 md:px-8">
        <motion.a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2 font-bold uppercase text-xs"
          style={{
            fontFamily: 'var(--y2k-font-ui)',
            background: '#CCFF00',
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

      {/* Schedule Timeline Component */}
      <div className="relative z-10">
        <ScheduleTimeline />
      </div>
    </div>
  );
}
