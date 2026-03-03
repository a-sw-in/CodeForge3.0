'use client';

import { motion, useReducedMotion } from 'framer-motion';
import InfiniteScroll from './InfiniteScroll';
import { IconStar, IconRocket, IconBulb, IconArrowUpRight } from '@tabler/icons-react';

const SPRING = { type: 'spring', stiffness: 300, damping: 24 };

/* ── Y2K "Tech Magazine" sub-aesthetic ──
   Background: cream/white (#FFFDF5)
   Accent colors: electric blue, lime, hot pink applied as stamps/badges
   Typography: Big bold Bebas Neue numbers, Space Grotesk labels
   Cards: Asymmetric, some rotated stickers, some full-bleed banners
*/

const pastEvents = [
  { name: 'TechFest 2024', description: 'Annual festival — coding competitions, workshops, tech talks.', date: 'Mar 2024' },
  { name: 'AI Workshop Series', description: 'ML and Artificial Intelligence deep-dive workshop series.', date: 'Jan 2024' },
  { name: 'CodeForge 2.0', description: 'Previous flagship hackathon — 200+ participants.', date: 'Nov 2023' },
  { name: 'Robotics Championship', description: 'Inter-college robotics competition, autonomous & manual.', date: 'Sep 2023' },
  { name: 'Web Dev Bootcamp', description: '3-day bootcamp on modern web development.', date: 'Jul 2023' },
  { name: 'Cybersecurity Week', description: 'Week-long cybersecurity awareness and workshops.', date: 'Jun 2023' },
];

const SCROLL_COLORS = ['#0055FF', '#CCFF00', '#FF44AA', '#0055FF'];

const scrollItems = [...pastEvents, ...pastEvents].map((e, i) => ({
  content: (
    <div key={i} className="flex items-stretch gap-0 overflow-hidden"
      style={{ border: '2px solid #001A6E', background: '#FFFFFF' }}>
      {/* Color tab */}
      <div className="w-2 shrink-0" style={{ background: SCROLL_COLORS[i % 4] }} />
      <div className="flex-1 flex items-center gap-3 px-3 py-2.5">
        <div>
          <p className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: SCROLL_COLORS[i % 4] }}>{e.date}</p>
          <p className="font-black text-sm" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>{e.name}</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748B', fontFamily: 'var(--y2k-font-ui)' }}>{e.description}</p>
        </div>
      </div>
    </div>
  ),
}));

const STATS = [
  { v: '200+', l: 'Participants', c: '#0055FF', textC: '#FFFFFF' },
  { v: '₹15K', l: 'Prize Pool', c: '#CCFF00', textC: '#001A6E' },
  { v: '24H', l: 'Duration', c: '#FF44AA', textC: '#FFFFFF' },
  { v: '20+', l: 'Mentors', c: '#001A6E', textC: '#CCFF00' },
];

const About = () => {
  const reduce = useReducedMotion();

  return (
    <section id="about-section" className="relative py-20 px-6 overflow-hidden" style={{ background: '#FFFDF5' }}>
      {/* Faint diagonal stripes top-right corner for texture */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #0055FF 0px, #0055FF 2px, transparent 2px, transparent 20px)' }} />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── MASTHEAD: magazine header ── */}
        <motion.div className="mb-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-4"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={SPRING} viewport={{ once: true }}>
          <div>
            {/* Section label stamp */}
            <div className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase tracking-widest text-white"
              style={{ background: '#0055FF', fontFamily: 'var(--y2k-font-mono)' }}>
              § section_02
            </div>
            <h2 className="text-7xl md:text-[110px] font-black uppercase leading-none"
              style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', lineHeight: '0.9', letterSpacing: '-0.02em' }}>
              ABOUT
            </h2>
          </div>
          {/* Issue info right side */}
          <div className="text-right shrink-0">
            <p className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#94A3B8' }}>IEEE SB UCEK</p>
            <p className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#94A3B8' }}>VOL. 3 / 2025</p>
          </div>
        </motion.div>

        {/* ── STAT STRIP: spec sheet style ── */}
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-14"
          style={{ border: '3px solid #001A6E' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }} viewport={{ once: true }}>
          {STATS.map(({ v, l, c, textC }, i) => (
            <div key={l} className="flex flex-col items-center justify-center py-6 px-4"
              style={{
                background: c,
                borderRight: i < 3 ? '3px solid #001A6E' : undefined,
                borderBottom: i < 2 ? '3px solid #001A6E' : undefined,
              }}>
              <span className="text-5xl font-black leading-none" style={{ fontFamily: 'var(--y2k-font-display)', color: textC }}>{v}</span>
              <span className="text-xs font-black uppercase mt-1" style={{ fontFamily: 'var(--y2k-font-mono)', color: textC, opacity: 0.8 }}>{l}</span>
            </div>
          ))}
        </motion.div>

        {/* ── BODY: two columns ── */}
        <div className="grid lg:grid-cols-5 gap-8">

          {/* Left: editorial text (3 of 5) */}
          <motion.div className="lg:col-span-3 space-y-0"
            style={{ border: '3px solid #001A6E' }}
            initial={{ opacity: 0, x: reduce ? 0 : -50 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.15 }} viewport={{ once: true }}>
            {/* Blue banner */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: '#0055FF', borderBottom: '3px solid #001A6E' }}>
              <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: '#CCFF00', border: '2px solid rgba(255,255,255,0.4)' }}>
                <IconRocket size={16} strokeWidth={3} color="#001A6E" />
              </div>
              <h3 className="font-black text-base uppercase text-white" style={{ fontFamily: 'var(--y2k-font-display)', letterSpacing: '0.04em' }}>
                The Ultimate Coding Challenge
              </h3>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#334155', fontFamily: 'var(--y2k-font-ui)' }}>
                CodeForge 3.0 is a revolutionary coding battlefield where innovation meets creativity.
                Organized by <strong>IEEE Student Branch UCEK</strong>, this premier event brings together
                the brightest minds in technology to forge the future.
              </p>
              <div className="h-px bg-current mb-4" style={{ background: '#E2E8F0' }} />

              {/* Hot pink banner */}
              <div className="flex items-center gap-3 px-5 py-3 -mx-5 bg-pink-50" style={{ borderTop: '3px solid #001A6E', borderBottom: '3px solid #001A6E' }}>
                <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: '#FF44AA', border: '2px solid #001A6E' }}>
                  <IconBulb size={16} strokeWidth={3} color="#FFFFFF" />
                </div>
                <h3 className="font-black text-base uppercase" style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.04em' }}>
                  Why CodeForge 3.0?
                </h3>
              </div>
              <p className="text-sm leading-relaxed mt-4" style={{ color: '#334155', fontFamily: 'var(--y2k-font-ui)' }}>
                We believe in pushing boundaries and creating solutions that matter.
                This hackathon is your gateway to innovation, industry networking, and
                showcasing your skills on a grand stage.
              </p>

              {/* CTA strip */}
              <div className="flex items-center gap-2 mt-5 pt-4" style={{ borderTop: '2px dashed #CBD5E1' }}>
                <span className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#94A3B8' }}>IEEE SB UCEK × IEEE RAS SB UCEK</span>
                <div className="ml-auto flex items-center gap-1 text-xs font-black uppercase" style={{ color: '#0055FF', fontFamily: 'var(--y2k-font-mono)' }}>
                  Register <IconArrowUpRight size={12} strokeWidth={3} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: scrolling events (2 of 5) */}
          <motion.div className="lg:col-span-2"
            initial={{ opacity: 0, x: reduce ? 0 : 50 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.2 }} viewport={{ once: true }}>
            <div style={{ border: '3px solid #001A6E', height: '420px', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
                <span className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>past-events.log</span>
                <div className="w-4 h-4 bg-white flex items-center justify-center text-xs font-black" style={{ border: '1.5px solid #001A6E', color: '#001A6E' }}>✕</div>
              </div>
              <div className="flex-1 overflow-hidden p-3">
                <InfiniteScroll items={scrollItems} width="100%" itemMinHeight={85}
                  negativeMargin="-0.8em" isTilted={false} autoplay={true}
                  autoplaySpeed={0.3} autoplayDirection="up" pauseOnHover={true} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
