'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import data from '@/data/hackathon.json';

const SPRING = { type: 'spring', stiffness: 300, damping: 24 };
const COLORS = ['#0055FF', '#FF44AA', '#0055FF', '#FF44AA', '#0055FF', '#FF44AA', '#0055FF', '#FF44AA'];
const { faq: faqData } = data;

function BlinkDot({ color }) {
  return (
    <motion.div className="w-2 h-2 rounded-full shrink-0"
      style={{ background: color }}
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 1.2, repeat: Infinity }} />
  );
}

export default function RulesAndFAQ() {
  const [expanded, setExpanded] = useState(null);
  const reduce = useReducedMotion();

  return (
    <section id="register-section" className="relative py-16 md:py-20 px-4 md:px-6 overflow-hidden" style={{ background: '#CCFF00' }}>
      {/* Diagonal texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 8px)' }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header window */}
        <motion.div className="mb-8"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={SPRING} viewport={{ once: true }}>
          <div style={{ border: '3px solid #001A6E', background: '#FFFFFF', boxShadow: '6px 6px 0px #001A6E' }}>
            <div className="flex items-center gap-2 px-3 py-2"
              style={{ background: 'linear-gradient(90deg, #0055FF 0%, #0033AA 100%)', borderBottom: '3px solid #001A6E' }}>
              <BlinkDot color="#00FF88" />
              <span className="flex-1 font-black text-xs uppercase tracking-widest text-white truncate"
                style={{ fontFamily: 'var(--y2k-font-mono)' }}>
                CodeForge_FAQ — {faqData.length} new messages
              </span>
              <div className="flex gap-1 shrink-0">
                {['—', '□', '✕'].map(c => (
                  <div key={c} className="w-4 h-4 bg-white items-center justify-center text-xs font-black hidden sm:flex"
                    style={{ border: '1.5px solid rgba(0,26,110,0.5)', color: '#001A6E' }}>{c}</div>
                ))}
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase leading-none"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '-0.01em' }}>
                GOT QUESTIONS?
              </h2>
              <p className="font-black text-xs uppercase mt-1" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#64748B' }}>
                Tap any message to expand reply
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqData.map((faq, idx) => {
            const isOpen = expanded === idx;
            const color = COLORS[idx % COLORS.length];

            return (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: idx * 0.04 }} viewport={{ once: true, margin: '-10px' }}>
                <div style={{
                  border: '3px solid #001A6E',
                  background: '#FFFFFF',
                  boxShadow: isOpen ? `5px 5px 0px ${color}` : '3px 3px 0px rgba(0,26,110,0.4)',
                  transition: 'box-shadow 0.15s ease',
                }}>
                  <button onClick={() => setExpanded(isOpen ? null : idx)}
                    className="w-full flex items-center gap-2 sm:gap-3 p-3 text-left">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-black text-white shrink-0"
                      style={{ background: color, border: '2px solid #001A6E', fontFamily: 'var(--y2k-font-display)', fontSize: '0.85rem' }}>
                      {String.fromCharCode(65 + (idx % 26))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color }}>
                          user_{String(idx + 1).padStart(3, '0')}
                        </span>
                        <span className="text-xs" style={{ color: '#94A3B8', fontFamily: 'var(--y2k-font-mono)' }}>asks:</span>
                      </div>
                      <p className="font-bold text-sm leading-snug" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                        {faq.question}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.18 }}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-black shrink-0"
                      style={{
                        background: isOpen ? color : '#F1F5F9',
                        border: '2px solid #001A6E',
                        color: isOpen ? '#FFFFFF' : '#001A6E',
                        fontFamily: 'var(--y2k-font-ui)', fontSize: '1rem',
                        transition: 'background 0.2s, color 0.2s',
                      }}>+</motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div key="reply"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.22 }, opacity: { duration: 0.15, delay: 0.05 } } }}
                        exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.18 }, opacity: { duration: 0.1 } } }}
                        className="overflow-hidden">
                        <div className="px-3 pb-3" style={{ borderTop: '2px solid #E2E8F0' }}>
                          <div className="flex items-start gap-2 sm:gap-3 pt-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-black shrink-0"
                              style={{ background: '#CCFF00', border: '2px solid #001A6E', fontFamily: 'var(--y2k-font-display)', color: '#001A6E', fontSize: '0.7rem' }}>
                              CF
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', WebkitTextStroke: '0.3px #001A6E', color: '#5a8a00' }}>
                                  CodeForge_Bot
                                </span>
                                <span className="text-xs" style={{ color: '#94A3B8', fontFamily: 'var(--y2k-font-mono)' }}>replies:</span>
                              </div>
                              <div className="p-3 text-sm" style={{ background: '#F0FFF4', border: '2px solid #001A6E', fontFamily: 'var(--y2k-font-ui)', color: '#334155', lineHeight: '1.65' }}>
                                {faq.answer}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.div className="mt-6 flex items-center gap-2"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <BlinkDot color="#001A6E" />
          <p className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>
            Still have questions? Email: {data.event.email}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
