'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { IconArrowRight } from '@tabler/icons-react';

const SPRING = { type: 'spring', stiffness: 300, damping: 24 };

/* ── Y2K "Event Ticket" sub-aesthetic ──
   Background: Electric blue (matches hero)
   Each event is a tear-off concert ticket stub
   Left: colored numbered tab with big event number
   Center: event title in Bebas Neue, description
   Right: date "stub" separated by dashed perforation line
   Colors rotate: lime, cyan, pink
*/

const scheduleData = [
  { title: 'Registration Opens', date: 'JUL 10', year: '2025', description: 'Kick off your CodeForge 3.0 journey! Registration opens for all participants.', color: '#CCFF00', textColor: '#001A6E' },
  { title: 'Registration Closes', date: 'JUL 20', year: '2025', description: "Last day to register. Don't miss your chance to compete!", color: '#00CCFF', textColor: '#001A6E' },
  { title: 'Shortlisting', date: 'JUL 22', year: '2025', description: 'Teams shortlisted based on profiles and submitted ideas.', color: '#FF44AA', textColor: '#FFFFFF' },
  { title: 'Hackathon Kickoff', date: 'JUL 25', year: '2025', description: 'The hackathon begins! Start building your innovative solution.', color: '#CCFF00', textColor: '#001A6E' },
  { title: 'Hackathon Ends', date: 'JUL 27', year: '2025', description: 'Submit your project before the final deadline.', color: '#00CCFF', textColor: '#001A6E' },
  { title: 'Results & Awards', date: 'JUL 30', year: '2025', description: 'Winners announced and prizes awarded in a live ceremony.', color: '#FF44AA', textColor: '#FFFFFF' },
];

export default function ScheduleTimeline() {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-20 px-6 overflow-hidden" style={{ background: '#0044DD' }}>
      {/* Watermark */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, r) => (
          <div key={r} style={{ opacity: 0.1, whiteSpace: 'nowrap', fontFamily: 'var(--y2k-font-display)', fontSize: '4rem', fontWeight: 900, color: '#FFFFFF', lineHeight: '1.2' }}>
            {'SCHEDULE · TIMELINE · CODEFORGE · '}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* ── Section header ── */}
        <motion.div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-4"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={SPRING} viewport={{ once: true }}>
          <div>
            <div className="inline-block px-3 py-1 mb-3 text-xs font-black uppercase tracking-widest"
              style={{ background: '#CCFF00', fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>
              § section_03 — event-schedule
            </div>
            <h2 className="text-7xl md:text-[100px] font-black uppercase leading-none text-white"
              style={{ fontFamily: 'var(--y2k-font-display)', letterSpacing: '-0.02em' }}>
              SCHEDULE
            </h2>
          </div>
          <p className="text-xs font-black uppercase text-right shrink-0"
            style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.5)' }}>
            6 EVENTS<br />JULY 2025
          </p>
        </motion.div>

        {/* ── Ticket stubs ── */}
        <div className="space-y-3">
          {scheduleData.map((item, idx) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, x: reduce ? 0 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: idx * 0.07 }}
              viewport={{ once: true, margin: '-20px' }}
              whileHover={reduce ? {} : { scale: 1.01, transition: { duration: 0.15 } }}>

              {/* Ticket wrapper */}
              <div className="flex items-stretch overflow-hidden"
                style={{ border: '3px solid #FFFFFF', background: '#FFFFFF', boxShadow: `4px 4px 0px ${item.color}` }}>

                {/* LEFT: color tab — event number */}
                <div className="flex flex-col items-center justify-center w-20 shrink-0"
                  style={{ background: item.color }}>
                  <span className="font-black text-3xl leading-none"
                    style={{ fontFamily: 'var(--y2k-font-display)', color: item.textColor }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-black uppercase mt-0.5"
                    style={{ fontFamily: 'var(--y2k-font-mono)', color: item.textColor, opacity: 0.7 }}>
                    event
                  </span>
                </div>

                {/* CENTER: event info */}
                <div className="flex-1 px-5 py-4">
                  <h3 className="text-2xl md:text-3xl font-black uppercase leading-tight mb-1"
                    style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.01em' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#475569' }}>
                    {item.description}
                  </p>
                </div>

                {/* Perforation border */}
                <div className="w-px shrink-0 self-stretch"
                  style={{ borderLeft: '3px dashed #CBD5E1', margin: '8px 0' }} />

                {/* RIGHT: date stub */}
                <div className="flex flex-col items-center justify-center px-5 py-4 shrink-0 min-w-[90px]"
                  style={{ background: '#FFFDF5' }}>
                  <span className="text-3xl font-black leading-none"
                    style={{ fontFamily: 'var(--y2k-font-display)', color: item.color === '#FF44AA' ? '#FF44AA' : '#001A6E' }}>
                    {item.date.slice(4)}
                  </span>
                  <span className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#94A3B8' }}>
                    {item.date.slice(0, 3)}
                  </span>
                  <span className="text-xs font-black" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#94A3B8' }}>
                    {item.year}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom strip */}
        <motion.div className="mt-8 flex items-center justify-between"
          style={{ borderTop: '3px solid rgba(255,255,255,0.2)', paddingTop: '1.25rem' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.4)' }}>
            All times IST · Venue TBA
          </p>
          <div className="flex items-center gap-1 text-xs font-black uppercase" style={{ color: '#CCFF00', fontFamily: 'var(--y2k-font-mono)' }}>
            Register now <IconArrowRight size={12} strokeWidth={3} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
