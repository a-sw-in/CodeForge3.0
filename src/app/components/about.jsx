'use client';

import { motion, useReducedMotion } from 'framer-motion';
import InfiniteScroll from './InfiniteScroll';
import { IconStar, IconRocket, IconBulb, IconArrowUpRight } from '@tabler/icons-react';
import data from '@/data/hackathon.json';

const SPRING = { type: 'spring', stiffness: 300, damping: 24 };
const PALETTE = ['#0055FF', '#CCFF00', '#FF44AA', '#0055FF'];

const { stats, pastEvents, event } = data;

const scrollItems = [...pastEvents, ...pastEvents].map((e, i) => ({
  content: (
    <div key={i} className="flex items-stretch gap-0 overflow-hidden"
      style={{ border: '2px solid #001A6E', background: '#FFFFFF' }}>
      <div className="w-2 shrink-0" style={{ background: PALETTE[i % 4] }} />
      <div className="flex-1 flex items-center gap-3 px-3 py-2.5">
        <div>
          <p className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: PALETTE[i % 4] }}>{e.date}</p>
          <p className="font-black text-sm" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>{e.name}</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748B', fontFamily: 'var(--y2k-font-ui)' }}>{e.description}</p>
        </div>
      </div>
    </div>
  ),
}));

// stat colors
const STAT_COLORS = [
  { c: '#0055FF', textC: '#FFFFFF' },
  { c: '#CCFF00', textC: '#001A6E' },
  { c: '#FF44AA', textC: '#FFFFFF' },
  { c: '#001A6E', textC: '#CCFF00' },
];

const About = () => {
  const reduce = useReducedMotion();

  return (
    <section id="about-section" className="relative py-16 md:py-20 px-4 md:px-6 overflow-hidden" style={{ background: '#FFFDF5' }}>
      {/* Diagonal stripes */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #0055FF 0px, #0055FF 2px, transparent 2px, transparent 20px)' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Masthead */}
        <motion.div className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={SPRING} viewport={{ once: true }}>
          <div>
            <div className="inline-block px-3 py-1 mb-3 text-xs font-black uppercase tracking-widest text-white"
              style={{ background: '#0055FF', fontFamily: 'var(--y2k-font-mono)' }}>
              § section_02
            </div>
            <h2 className="text-6xl sm:text-7xl md:text-[110px] font-black uppercase leading-none"
              style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', lineHeight: '0.9', letterSpacing: '-0.02em' }}>
              ABOUT
            </h2>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#94A3B8' }}>{event.organizer}</p>
            <p className="font-black text-xs uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#94A3B8' }}>VOL. 3 / 2025</p>
          </div>
        </motion.div>

        {/* Stat strip */}
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-10"
          style={{ border: '3px solid #001A6E' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }} viewport={{ once: true }}>
          {stats.map(({ value, label }, i) => (
            <div key={label} className="flex flex-col items-center justify-center py-5 px-3"
              style={{
                background: STAT_COLORS[i].c,
                borderRight: i < stats.length - 1 ? '3px solid #001A6E' : undefined,
                borderBottom: i < 2 ? '3px solid #001A6E' : undefined,
              }}>
              <span className="text-4xl font-black leading-none" style={{ fontFamily: 'var(--y2k-font-display)', color: STAT_COLORS[i].textC }}>{value}</span>
              <span className="text-xs font-black uppercase mt-1" style={{ fontFamily: 'var(--y2k-font-mono)', color: STAT_COLORS[i].textC, opacity: 0.8 }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Left: editorial */}
          <motion.div className="lg:col-span-3"
            style={{ border: '3px solid #001A6E' }}
            initial={{ opacity: 0, x: reduce ? 0 : -50 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.15 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 px-4 sm:px-5 py-4" style={{ background: '#0055FF', borderBottom: '3px solid #001A6E' }}>
              <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: '#CCFF00', border: '2px solid rgba(255,255,255,0.4)' }}>
                <IconRocket size={16} strokeWidth={3} color="#001A6E" />
              </div>
              <h3 className="font-black text-sm md:text-base uppercase text-white" style={{ fontFamily: 'var(--y2k-font-display)', letterSpacing: '0.04em' }}>
                The Ultimate Coding Challenge
              </h3>
            </div>
            <div className="px-4 sm:px-5 py-4 sm:py-5">
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#334155', fontFamily: 'var(--y2k-font-ui)' }}>
                CodeForge 3.0 is a revolutionary coding battlefield where innovation meets creativity.
                Organized by <strong>{event.organizer}</strong>, this premier event brings
                the brightest minds in technology to forge the future.
              </p>
              <div className="h-px mb-4" style={{ background: '#E2E8F0' }} />
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 -mx-4 sm:-mx-5"
                style={{ background: '#FFF0F5', borderTop: '3px solid #001A6E', borderBottom: '3px solid #001A6E' }}>
                <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: '#FF44AA', border: '2px solid #001A6E' }}>
                  <IconBulb size={16} strokeWidth={3} color="#FFFFFF" />
                </div>
                <h3 className="font-black text-sm md:text-base uppercase" style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.04em' }}>
                  Why CodeForge 3.0?
                </h3>
              </div>
              <p className="text-sm leading-relaxed mt-4" style={{ color: '#334155', fontFamily: 'var(--y2k-font-ui)' }}>
                We believe in pushing boundaries and creating solutions that matter.
                This hackathon is your gateway to innovation, industry networking,
                and showcasing your skills on a grand stage.
              </p>
              <div className="flex items-center gap-2 mt-5 pt-4 flex-wrap" style={{ borderTop: '2px dashed #CBD5E1' }}>
                <span className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#94A3B8' }}>
                  {event.organizer} × {event.coOrganizer}
                </span>
                <a href="/login" className="ml-auto flex items-center gap-1 text-xs font-black uppercase" style={{ color: '#0055FF', fontFamily: 'var(--y2k-font-mono)' }}>
                  Register <IconArrowUpRight size={12} strokeWidth={3} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right: past events */}
          <motion.div className="lg:col-span-2"
            initial={{ opacity: 0, x: reduce ? 0 : 50 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.2 }} viewport={{ once: true }}>
            <div style={{ border: '3px solid #001A6E', height: '380px', display: 'flex', flexDirection: 'column' }}>
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
