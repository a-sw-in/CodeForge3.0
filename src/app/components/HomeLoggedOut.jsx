'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconTrophy, IconUsers, IconBolt, IconX } from '@tabler/icons-react';
import About from './about';
import ScheduleTimeline from './ScheduleTimeline';
import RulesAndFAQ from './RulesAndFAQ';
import Footer from './Footer';

/* ─── Spring ─── */
const SPRING = { type: 'spring', stiffness: 300, damping: 24 };

/* ─── Countdown ─── */
function useCountdown(targetDate) {
  const calc = () => {
    const diff = Math.max(0, targetDate - Date.now());
    return {
      days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
      hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
      minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
      seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return t;
}

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

/* ─── Pixelated cursor SVG ─── */
function PixelCursor({ size = 80, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} aria-hidden="true">
      <rect x="2" y="2" width="4" height="4" fill="#fff" />
      <rect x="2" y="6" width="4" height="4" fill="#fff" />
      <rect x="2" y="10" width="4" height="4" fill="#fff" />
      <rect x="2" y="14" width="4" height="4" fill="#fff" />
      <rect x="2" y="18" width="4" height="4" fill="#fff" />
      <rect x="6" y="6" width="4" height="4" fill="#fff" />
      <rect x="6" y="10" width="4" height="4" fill="#fff" />
      <rect x="6" y="14" width="4" height="4" fill="#fff" />
      <rect x="10" y="10" width="4" height="4" fill="#fff" />
      <rect x="10" y="14" width="4" height="4" fill="#fff" />
      <rect x="10" y="18" width="4" height="4" fill="#fff" />
      <rect x="14" y="14" width="4" height="4" fill="#fff" />
      <rect x="14" y="18" width="4" height="4" fill="#fff" />
      <rect x="14" y="22" width="4" height="4" fill="#fff" />
      <rect x="18" y="18" width="4" height="4" fill="#fff" />
      <rect x="18" y="22" width="4" height="4" fill="#fff" />
      {/* black outline */}
      <rect x="0" y="0" width="4" height="6" fill="#000" />
      <rect x="0" y="4" width="2" height="18" fill="#000" />
      <rect x="4" y="4" width="2" height="2" fill="#000" />
    </svg>
  );
}

/* ─── Window Card ─── */
function WindowCard({ logo = 'CF 3.0', children, className = '', style = {} }) {
  return (
    <div className={`flex flex-col ${className}`}
      style={{ border: '3px solid #001A6E', background: '#FFFFFF', ...style }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
        <span className="font-bold text-sm" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.02em' }}>
          {logo}
        </span>
        <div className="flex items-center justify-center w-6 h-6 bg-white"
          style={{ border: '2px solid #001A6E', cursor: 'pointer' }}>
          <IconX size={12} strokeWidth={3} color="#001A6E" />
        </div>
      </div>
      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

/* ─── Y2K Button ─── */
function Y2KButton({ children, onClick, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <motion.button onClick={onClick}
      className="inline-flex items-center gap-2 px-6 py-2.5 font-bold uppercase tracking-wider text-sm"
      style={{
        fontFamily: 'var(--y2k-font-ui)',
        background: isPrimary ? '#CCFF00' : 'transparent',
        color: '#001A6E',
        border: '3px solid #001A6E',
        letterSpacing: '0.08em',
        boxShadow: isPrimary ? '4px 4px 0px #001A6E' : 'none',
      }}
      whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0px #001A6E', transition: { duration: 0.15 } }}
      whileTap={{ x: 2, y: 2, boxShadow: '2px 2px 0px #001A6E' }}
    >
      {children}
      {isPrimary && <IconArrowRight size={16} strokeWidth={3} />}
    </motion.button>
  );
}

/* ─── Feature card data ─── */
const FEATURES = [
  { icon: IconTrophy, label: '₹15K+', sub: 'Prize Pool', color: '#CCFF00' },
  { icon: IconUsers, label: '2–4', sub: 'Team Size', color: '#00CCFF' },
  { icon: IconBolt, label: '24hr', sub: 'Hackathon', color: '#FF44AA' },
];

/* ─── Marquee strip ─── */
function MarqueeStrip() {
  const words = ['CODEFORGE 3.0', '★', 'IEEE UCEK', '★', '24 HOURS', '★', 'BUILD & WIN', '★', 'MARCH 2025', '★'];
  const rep = [...words, ...words];
  return (
    <div className="w-full overflow-hidden py-3" style={{ background: '#CCFF00', borderTop: '3px solid #001A6E', borderBottom: '3px solid #001A6E' }}>
      <div className="pg-animate-marquee flex whitespace-nowrap w-max gap-8">
        {rep.map((w, i) => (
          <span key={i} className="text-sm font-black uppercase tracking-widest" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function HomeLoggedOut() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const time = useCountdown(new Date('2025-04-15T09:00:00'));

  const handleRegister = () => router.push('/login');
  const scrollToAbout = () => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ background: '#0055FF', fontFamily: 'var(--y2k-font-ui)', color: '#FFFFFF' }}>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ paddingTop: '80px' }}>
        <Watermark />

        {/* Star bursts */}
        <StarBurst size={180} style={{ position: 'absolute', top: '6%', left: '3%', zIndex: 1, opacity: 0.95 }} />
        <StarBurst size={120} style={{ position: 'absolute', bottom: '12%', left: '8%', zIndex: 1, opacity: 0.8 }} />
        <StarBurst size={200} style={{ position: 'absolute', top: '5%', right: '2%', zIndex: 1, opacity: 0.9 }} />
        <StarBurst size={90} style={{ position: 'absolute', bottom: '8%', right: '10%', zIndex: 1, opacity: 0.75 }} />
        <StarBurst color="#00CCFF" size={70} style={{ position: 'absolute', top: '45%', right: '5%', zIndex: 1, opacity: 0.7 }} />

        {/* Pixelated cursor decoration */}
        <PixelCursor size={100} style={{ position: 'absolute', bottom: '18%', right: '30%', zIndex: 2, filter: 'drop-shadow(4px 4px 0px #001A6E)' }} />

        {/* Content */}
        <div className="relative z-10 flex-1 max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-10 px-6 py-16 lg:py-0">

          {/* LEFT: Main window card */}
          <motion.div className="flex-1 w-full max-w-xl"
            initial={{ opacity: 0, y: reduce ? 0 : 60 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.15 }}>
            <WindowCard logo="codeforge™">
              <div className="p-6 md:p-8">
                {/* Badge */}
                <div className="inline-block mb-4 px-3 py-1 font-bold text-xs uppercase tracking-widest"
                  style={{ background: '#CCFF00', border: '3px solid #001A6E', fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                  IEEE SB UCEK · HACKATHON
                </div>

                {/* Big title */}
                <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-2"
                  style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '-0.01em' }}>
                  CODE<br />FORGE
                </h1>
                <p className="text-2xl md:text-3xl font-black uppercase mb-1"
                  style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  3.0
                </p>

                {/* Subtext row */}
                <div className="flex flex-wrap gap-3 mt-4 mb-6">
                  <span className="text-xs font-mono font-bold uppercase" style={{ color: '#64748B', fontFamily: 'var(--y2k-font-mono)' }}>
                    CYBER ATMOSPHERE
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: '#334155', fontFamily: 'var(--y2k-font-ui)' }}>
                  The ultimate 24-hour coding showdown. Build, compete, and win — organized by IEEE Student Branch UCEK.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-3">
                  <Y2KButton onClick={handleRegister}>Register Now</Y2KButton>
                  <Y2KButton onClick={scrollToAbout} variant="secondary">Learn More</Y2KButton>
                </div>

                {/* Bottom label row */}
                <div className="flex gap-6 mt-6 pt-4" style={{ borderTop: '2px dashed #CBD5E1' }}>
                  <span className="text-xs font-black uppercase" style={{ color: '#94A3B8', fontFamily: 'var(--y2k-font-mono)' }}>HACKATHON</span>
                  <span className="text-xs font-black uppercase" style={{ color: '#94A3B8', fontFamily: 'var(--y2k-font-mono)' }}>IEEE 2025</span>
                </div>
              </div>
            </WindowCard>
          </motion.div>

          {/* RIGHT: Countdown window */}
          <motion.div className="w-full max-w-xs lg:max-w-sm"
            initial={{ opacity: 0, y: reduce ? 0 : 60 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.3 }}>
            <WindowCard logo="event-timer.exe">
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-widest mb-4 text-center"
                  style={{ fontFamily: 'var(--y2k-font-mono)', color: '#64748B' }}>
                  ⏳ EVENT STARTS IN
                </p>

                {/* Timer grid */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {[{ v: time.days, l: 'DAYS' }, { v: time.hours, l: 'HRS' }, { v: time.minutes, l: 'MIN' }, { v: time.seconds, l: 'SEC' }].map(({ v, l }) => (
                    <div key={l} className="flex flex-col items-center">
                      <div className="w-full py-3 text-center font-black text-2xl"
                        style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', background: '#CCFF00', border: '3px solid #001A6E', letterSpacing: '-0.02em' }}>
                        {v}
                      </div>
                      <span className="text-xs font-black mt-1" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#64748B' }}>{l}</span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ borderTop: '2px solid #E2E8F0', marginBottom: '1rem' }} />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: '₹15K+', l: 'Prizes', c: '#CCFF00' },
                    { v: '200+', l: 'Hackers', c: '#00CCFF' },
                    { v: '20+', l: 'Mentors', c: '#FF44AA' },
                    { v: '24hr', l: 'Duration', c: '#CCFF00' },
                  ].map(({ v, l, c }) => (
                    <div key={l} className="flex items-center gap-2 p-2" style={{ border: '2px solid #001A6E', background: '#F8FAFC' }}>
                      <div className="w-3 h-3 shrink-0" style={{ background: c, border: '1.5px solid #001A6E' }} />
                      <div>
                        <div className="font-black text-base leading-none" style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>{v}</div>
                        <div className="text-xs" style={{ color: '#64748B', fontFamily: 'var(--y2k-font-mono)' }}>{l}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </WindowCard>

            {/* Feature pills below */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {FEATURES.map(({ icon: Icon, label, sub, color }) => (
                <div key={sub} className="flex items-center gap-2 px-3 py-2"
                  style={{ background: color, border: '3px solid #001A6E', boxShadow: '3px 3px 0px #001A6E' }}>
                  <Icon size={14} strokeWidth={3} color="#001A6E" />
                  <span className="font-black text-xs" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>{label} <span className="font-normal">{sub}</span></span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="relative z-10 flex justify-center pb-8 gap-2 items-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <div className="w-2 h-2" style={{ background: '#CCFF00', border: '2px solid #001A6E' }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ fontFamily: 'var(--y2k-font-mono)' }}>scroll_down.exe</span>
          <div className="w-2 h-2" style={{ background: '#CCFF00', border: '2px solid #001A6E' }} />
        </motion.div>
      </section>

      {/* Marquee */}
      <MarqueeStrip />

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: '#0044DD' }}>
        <Watermark />
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div className="mb-12"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={SPRING} viewport={{ once: true }}>
            <WindowCard logo="why-codeforge.exe" style={{ maxWidth: '480px' }}>
              <div className="px-6 py-4">
                <h2 className="text-5xl md:text-7xl font-black uppercase" style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>
                  WHY<br />FORGE?
                </h2>
              </div>
            </WindowCard>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Cash Prizes', desc: 'Compete for ₹15,000+ in prizes across multiple categories. Real rewards for real innovation.', color: '#CCFF00' },
              { title: 'Team Sprint', desc: '2-4 person teams tackling real problems in 24 hours. Collaboration at its finest.', color: '#00CCFF' },
              { title: '24hr Grind', desc: 'Intense, focused, exhilarating. Build something remarkable in a single day with expert mentors.', color: '#FF44AA' },
            ].map((card, i) => (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: i * 0.1 }} viewport={{ once: true }}
                whileHover={reduce ? {} : { y: -4, transition: { duration: 0.2 } }}>
                <WindowCard logo={`feature-0${i + 1}.exe`}>
                  <div className="p-5">
                    <div className="inline-block px-2 py-1 mb-3 font-black text-xs uppercase"
                      style={{ background: card.color, border: '2px solid #001A6E', fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-3xl font-black uppercase mb-2"
                      style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>{card.title}</h3>
                    <p className="text-sm" style={{ color: '#475569', fontFamily: 'var(--y2k-font-ui)' }}>{card.desc}</p>
                  </div>
                </WindowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <MarqueeStrip />

      {/* Existing sections */}
      <div id="about-section"><About /></div>
      <ScheduleTimeline />
      <div id="register-section"><RulesAndFAQ /></div>
      <Footer />
    </div>
  );
}
