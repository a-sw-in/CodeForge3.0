'use client';

import React from 'react';
import { motion } from 'framer-motion';

const BOUNCE = { type: 'spring', stiffness: 400, damping: 18 };

function Watermark() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {Array.from({ length: 10 }).map((_, r) => (
        <div key={r} style={{ opacity: 0.08, whiteSpace: 'nowrap', fontFamily: 'var(--y2k-font-display)', fontSize: '3.5rem', fontWeight: 900, color: '#0055FF', lineHeight: '1.2' }}>
          {'CODE FORGE · IEEE UCEK · HACKATHON · '.repeat(5)}
        </div>
      ))}
    </div>
  );
}

function StarBurst({ color = '#CCFF00', size = 120, style = {} }) {
  const pts = '50,2 59,29 81,15 70,40 97,34 79,55 100,50 79,45 97,66 70,60 81,85 59,71 50,98 41,71 19,85 30,60 3,66 21,45 0,50 21,55 3,34 30,40 19,15 41,29';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', ...style }} aria-hidden="true">
      <polygon points={pts} fill={color} />
    </svg>
  );
}

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#FFFDF5' }}>
      <Watermark />

      {/* Star bursts */}
      <StarBurst size={160} color="#0055FF" style={{ top: '5%', left: '2%', opacity: 0.15, zIndex: 0 }} />
      <StarBurst size={120} color="#0055FF" style={{ bottom: '10%', right: '3%', opacity: 0.12, zIndex: 0 }} />
      <StarBurst size={80} color="#CCFF00" style={{ top: '20%', right: '8%', opacity: 0.6, zIndex: 1 }} />
      <StarBurst size={60} color="#00CCFF" style={{ bottom: '20%', left: '6%', opacity: 0.5, zIndex: 1 }} />

      {/* Window card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...BOUNCE, delay: 0.2 }}
      >
        {/* Window chrome */}
        <div style={{ border: '3px solid #001A6E', background: '#FFFFFF', boxShadow: '6px 6px 0px #0055FF' }}>
          {/* Title bar */}
          <div className="flex items-center justify-between px-3 py-2"
            style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
            <span className="font-black text-sm uppercase tracking-widest"
              style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>loading.exe</span>
            <div className="w-5 h-5 bg-white flex items-center justify-center font-black text-xs"
              style={{ border: '2px solid #001A6E', color: '#001A6E' }}>✕</div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Brand */}
            <div className="mb-2">
              <h1 className="font-black uppercase leading-none"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '-0.01em', fontSize: '3.375rem' }}>
                CODEFORGE
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black uppercase"
                  style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>3.0</span>
                <div className="inline-flex items-center px-2 py-0.5 font-black text-xs uppercase"
                  style={{ background: '#CCFF00', border: '2px solid #001A6E', fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>
                  IEEE SB UCEK
                </div>
              </div>
            </div>

            {/* Status line */}
            <p className="text-xs font-black uppercase mb-5" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#64748B', letterSpacing: '0.1em' }}>
              &gt; Initializing_System...
            </p>

            {/* Progress bar */}
            <div className="w-full h-6 bg-white relative overflow-hidden"
              style={{ border: '3px solid #001A6E', boxShadow: '3px 3px 0px #001A6E' }}>
              <motion.div
                className="h-full"
                style={{
                  background: 'repeating-linear-gradient(90deg, #0055FF 0px, #0055FF 16px, #CCFF00 16px, #CCFF00 20px)',
                }}
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            {/* Animated dots */}
            <div className="flex gap-2 mt-5 justify-center">
              {['#0055FF', '#CCFF00', '#00CCFF', '#FF44AA'].map((c, i) => (
                <motion.div key={i} className="w-4 h-4"
                  style={{ background: c, border: '2px solid #001A6E' }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Loading;


