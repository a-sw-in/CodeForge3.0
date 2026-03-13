'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { IconArrowRight } from '@tabler/icons-react';
import data from '@/data/hackathon.json';

const SPRING = { type: 'spring', stiffness: 300, damping: 24 };
const { schedule } = data;

export default function ScheduleTimeline() {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-16 md:py-20 px-4 md:px-6 overflow-hidden" style={{ background: '##0055FF' }}>
      {/* Watermark */}
      

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={SPRING} viewport={{ once: true }}>
          <div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[100px] font-black uppercase leading-none text-white"
              style={{ fontFamily: 'var(--y2k-font-display)', letterSpacing: '-0.02em' }}>
              SCHEDULE
            </h2>
          </div>
        </motion.div>

        {/* Ticket stubs */}
        <div className="space-y-3">
          {schedule.map((item, idx) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, x: reduce ? 0 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: idx * 0.07 }}
              viewport={{ once: true, margin: '-20px' }}
              whileHover={reduce ? {} : { scale: 1.01, transition: { duration: 0.15 } }}>

              {/* Mobile: stacked layout */}
              <div className="block sm:hidden overflow-hidden"
                style={{ border: '3px solid #FFFFFF', background: '#FFFFFF', boxShadow: `4px 4px 0px ${item.color}` }}>
                <div className="flex items-center gap-0">
                  {/* Color tab */}
                  <div className="flex flex-col items-center justify-center w-14 py-4 shrink-0"
                    style={{ background: item.color }}>
                    <span className="font-black text-2xl leading-none"
                      style={{ fontFamily: 'var(--y2k-font-display)', color: item.textColor }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {/* Event info + date merged */}
                  <div className="flex-1 px-4 py-3">
                    <h3 className="text-xl font-black uppercase leading-tight mb-1"
                      style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>
                      {item.title}
                    </h3>
                    <p className="text-xs" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B' }}>
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs font-black px-2 py-0.5"
                        style={{ background: item.color, fontFamily: 'var(--y2k-font-mono)', color: item.textColor }}>
                        {item.date} {item.year}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: ticket with stub */}
              <div className="hidden sm:flex items-stretch overflow-hidden"
                style={{ border: '3px solid #FFFFFF', background: '#FFFFFF', boxShadow: `4px 4px 0px ${item.color}` }}>
                {/* Left color tab */}
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
                {/* Center */}
                <div className="flex-1 px-5 py-4">
                  <h3 className="text-2xl md:text-3xl font-black uppercase leading-tight mb-1"
                    style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#475569' }}>
                    {item.description}
                  </p>
                </div>
                {/* Perforation */}
                <div className="w-px shrink-0 self-stretch"
                  style={{ borderLeft: '3px dashed #CBD5E1', margin: '8px 0' }} />
                {/* Date stub */}
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

        {/* Footer strip */}
        <motion.div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{ borderTop: '3px solid rgba(255,255,255,0.2)', paddingTop: '1.25rem' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.4)' }}>
            All times IST · {data.event.location}
          </p>
          <a href="/login" className="flex items-center gap-1 text-xs font-black uppercase" style={{ color: '#CCFF00', fontFamily: 'var(--y2k-font-mono)' }}>
            Register now <IconArrowRight size={12} strokeWidth={3} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
