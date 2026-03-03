'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const SPRING = { type: 'spring', stiffness: 300, damping: 24 };

/* ── Y2K "IM Chat / Popup Dialog" sub-aesthetic ──
   Background: lime/chartreuse (#CCFF00)
   Cards: white popup windows styled like AIM/MSN Messenger dialogs
   Answers: look like chat bubbles in a Y2K IM window
   Vibe: early 2000s instant messaging, popup ads, dialog boxes
*/

const faqData = [
  { question: 'Who can participate in CodeForge 3.0?', answer: "Open to students, professionals, and coding enthusiasts of all skill levels. Beginner or expert — you're welcome!" },
  { question: 'Do I need a team?', answer: "Teams of 2-4 encouraged. Solo entries welcome. We'll help you find a team at the networking session." },
  { question: 'What should I bring?', answer: "Laptop, chargers, student ID, enthusiasm. We provide food, drinks, WiFi, and workspace throughout the event." },
  { question: 'Are there problem statements?', answer: "Yes! Announced at the opening. Themes: AI/ML, Web3, IoT, Sustainability, and Social Impact." },
  { question: 'What are the prizes?', answer: "Cash prizes, certificates, mentorship, internship offers from sponsors. All participants get certificates and merch!" },
  { question: 'Can I use external libraries?', answer: "Yes! Any open-source tools allowed. Core innovation must be original work created during the hackathon." },
  { question: 'Is there a registration fee?', answer: "No! Completely free — including events, meals, networking, workshops, and mentorship." },
  { question: 'Will there be mentors?', answer: "Yes! Industry experts and senior devs available throughout to give guidance and technical support." },
];

/* Blinking status dot */
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
    <section id="register-section" className="relative py-20 px-6 overflow-hidden" style={{ background: '#CCFF00' }}>
      {/* Diagonal texture on bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 8px)' }} />

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* ── IM window header ── */}
        <motion.div className="mb-8"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={SPRING} viewport={{ once: true }}>
          {/* Outer window frame */}
          <div style={{ border: '3px solid #001A6E', background: '#FFFFFF', boxShadow: '6px 6px 0px #001A6E' }}>
            {/* Title bar — deep blue like classic IM */}
            <div className="flex items-center gap-2 px-3 py-2"
              style={{ background: 'linear-gradient(90deg, #0055FF 0%, #0033AA 100%)', borderBottom: '3px solid #001A6E' }}>
              <BlinkDot color="#00FF88" />
              <span className="flex-1 font-black text-xs uppercase tracking-widest text-white"
                style={{ fontFamily: 'var(--y2k-font-mono)' }}>
                CodeForge_FAQ v1.0 — You have {faqData.length} new messages
              </span>
              <div className="flex gap-1">
                {['—', '□', '✕'].map(c => (
                  <div key={c} className="w-4 h-4 bg-white flex items-center justify-center text-xs font-black"
                    style={{ border: '1.5px solid rgba(0,26,110,0.5)', color: '#001A6E' }}>{c}</div>
                ))}
              </div>
            </div>
            <div className="px-6 py-5">
              <h2 className="text-5xl md:text-7xl font-black uppercase leading-none"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '-0.01em' }}>
                GOT QUESTIONS?
              </h2>
              <p className="font-black text-xs uppercase mt-1" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#64748B' }}>
                Click any message to expand reply
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Chat messages ── */}
        <div className="space-y-3">
          {faqData.map((faq, idx) => {
            const isOpen = expanded === idx;
            const COLORS = ['#0055FF', '#FF44AA', '#0055FF', '#FF44AA', '#0055FF', '#FF44AA', '#0055FF', '#FF44AA'];
            const color = COLORS[idx];
            const isBlue = color === '#0055FF';

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
                  {/* Question row — IM user row */}
                  <button onClick={() => setExpanded(isOpen ? null : idx)}
                    className="w-full flex items-center gap-3 p-3 text-left group">
                    {/* Avatar */}
                    <div className="w-9 h-9 flex items-center justify-center font-black text-white shrink-0"
                      style={{ background: color, border: '2px solid #001A6E', fontFamily: 'var(--y2k-font-display)', fontSize: '0.9rem' }}>
                      {`${String.fromCharCode(65 + (idx % 26))}`}
                    </div>
                    {/* Message bubble */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: color }}>
                          user_{String(idx + 1).padStart(3, '0')}
                        </span>
                        <span className="text-xs" style={{ color: '#94A3B8', fontFamily: 'var(--y2k-font-mono)' }}>asks:</span>
                      </div>
                      <p className="font-bold text-sm" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                        {faq.question}
                      </p>
                    </div>
                    {/* Expand indicator */}
                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.18 }}
                      className="w-7 h-7 flex items-center justify-center font-black shrink-0"
                      style={{
                        background: isOpen ? color : '#F1F5F9',
                        border: '2px solid #001A6E',
                        color: isOpen ? '#FFFFFF' : '#001A6E',
                        fontFamily: 'var(--y2k-font-ui)',
                        fontSize: '1rem',
                        transition: 'background 0.2s, color 0.2s',
                      }}>
                      +
                    </motion.div>
                  </button>

                  {/* Answer — chat reply */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="reply"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.22 }, opacity: { duration: 0.15, delay: 0.05 } } }}
                        exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.18 }, opacity: { duration: 0.1 } } }}
                        className="overflow-hidden">
                        <div className="px-3 pb-3" style={{ borderTop: '2px solid #E2E8F0' }}>
                          {/* Bot avatar row */}
                          <div className="flex items-start gap-3 pt-3">
                            <div className="w-9 h-9 flex items-center justify-center font-black shrink-0"
                              style={{ background: '#CCFF00', border: '2px solid #001A6E', fontFamily: 'var(--y2k-font-display)', color: '#001A6E', fontSize: '0.75rem' }}>
                              CF
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#CCFF00', textShadow: '0 0 0 #001A6E', WebkitTextStroke: '0.5px #001A6E' }}>
                                  CodeForge_Bot
                                </span>
                                <span className="text-xs" style={{ color: '#94A3B8', fontFamily: 'var(--y2k-font-mono)' }}>replies:</span>
                              </div>
                              {/* Chat bubble */}
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

        {/* Bottom system message */}
        <motion.div className="mt-6 flex items-center gap-2"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <BlinkDot color="#001A6E" />
          <p className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>
            Still have questions? Email us at ieeesbucek@gmail.com
          </p>
        </motion.div>
      </div>
    </section>
  );
}
