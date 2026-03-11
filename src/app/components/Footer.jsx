'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  IconBrandInstagram, IconBrandGithub, IconBrandX, IconBrandLinkedin,
  IconPhone, IconMail, IconArrowRight, IconStar,
} from '@tabler/icons-react';
import data from '@/data/hackathon.json';

const SPRING = { type: 'spring', stiffness: 300, damping: 24 };
const { event } = data;

const SOCIAL = [
  { Icon: IconBrandInstagram, c: '#FF44AA', label: 'IG', href: event.social.instagram },
  { Icon: IconBrandGithub, c: '#CCFF00', label: 'GH', href: event.social.github },
  { Icon: IconBrandX, c: '#FFFFFF', label: 'X', href: event.social.twitter },
  { Icon: IconBrandLinkedin, c: '#00CCFF', label: 'LI', href: event.social.linkedin },
];

const Footer = () => {
  const reduce = useReducedMotion();

  return (
    <footer className="relative overflow-hidden" style={{ background: '#001A6E' }}>
      {/* ── POSTER ZONE ── */}
      <div className="relative overflow-hidden" style={{ borderBottom: '4px solid #CCFF00' }}>
        {/* Diagonal lime stripe — hidden on mobile for clarity */}
        <div className="absolute inset-0 pointer-events-none hidden md:block" style={{
          background: 'linear-gradient(105deg, transparent 55%, #d0ff15ff 55%, #CCFF00 65%, transparent 65%)',
          zIndex: 0,
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col lg:flex-row items-start lg:items-end gap-8 justify-between">
          {/* Left: giant type */}
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            transition={SPRING} viewport={{ once: true }}>
            <div className="inline-block px-3 py-1 mb-4 text-xs font-black uppercase tracking-widest"
              style={{ background: '#FF44AA', fontFamily: 'var(--y2k-font-mono)', color: '#FFFFFF' }}>
              {event.organizer} × {event.coOrganizer}
            </div>
            <h2 className="text-6xl sm:text-8xl md:text-[130px] font-black uppercase leading-none"
              style={{ fontFamily: 'var(--y2k-font-display)', color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: '1' }}>
              CODE<br />FORGE<br />
              <span style={{ color: '#CCFF00' }}>3.0</span>
            </h2>
          </motion.div>

          {/* Right: register.exe box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.15 }} viewport={{ once: true }}
            className="w-full ml-[9vw] lg:w-auto shrink-0">
            <div style={{ border: '3px solid #CCFF00', background: '#ffffffff', boxShadow: '6px 6px 0px rgba(255,255,255,0.3)' }}>
              <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '3px solid #001A6E', background: '#CCFF00' }}>
                <span className="font-black text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>register.exe</span>
                <div className="w-4 h-4 bg-white flex items-center justify-center font-black text-xs" style={{ border: '1.5px solid #001A6E', color: '#001A6E' }}>✕</div>
              </div>
              <div className="px-5 sm:px-6 py-4 sm:py-5">
                <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#64748B' }}>
                  {event.duration} HACKATHON
                </p>
                <p className="text-2xl sm:text-3xl font-black uppercase leading-tight mb-4"
                  style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>
                  {event.dateDisplay.toUpperCase()}<br />{event.location}
                </p>
                <motion.a href="/login"
                  className="flex items-center gap-2 px-5 py-2.5 font-black text-sm uppercase w-full justify-center"
                  style={{ background: '#0055FF', color: '#FFFFFF', border: '3px solid #001A6E', boxShadow: '3px 3px 0px #001A6E', fontFamily: 'var(--y2k-font-ui)', letterSpacing: '0.05em' }}
                  whileHover={{ x: -2, y: -2, boxShadow: '5px 5px 0px #001A6E', transition: { duration: 0.15 } }}
                  whileTap={{ x: 1, y: 1, boxShadow: '1px 1px 0px #001A6E' }}>
                  Register Free <IconArrowRight size={14} strokeWidth={3} />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── INFO GRID ── */}
      <motion.div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }} viewport={{ once: true }}>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ border: '3px solid rgba(255,255,255,0.15)' }}>
          {/* Social */}
          <div className="p-4 sm:p-5" style={{ borderRight: '3px solid rgba(255,255,255,0.15)', borderBottom: '3px solid rgba(255,255,255,0.15)' }}>
            <p className="text-xs font-black uppercase mb-3" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#CCFF00' }}>FOLLOW_US</p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL.map(({ Icon, c, label, href }) => (
                <motion.a key={label} href={href}
                  className="w-9 h-9 flex items-center justify-center"
                  style={{ background: c, border: '2px solid rgba(255,255,255,0.3)' }}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  target="_blank" rel="noopener noreferrer">
                  <Icon size={16} strokeWidth={2.5} color="#001A6E" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="p-4 sm:p-5" style={{ borderRight: '3px solid rgba(255,255,255,0.15)', borderBottom: '3px solid rgba(255,255,255,0.15)' }}>
            <p className="text-xs font-black uppercase mb-3" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#00CCFF' }}>QUICK_LINKS</p>
            <div className="space-y-1.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '#about-section' },
                { label: 'Schedule', href: '#schedule' },
                { label: 'FAQ', href: '#register-section' },
                { label: 'Register', href: '/login' },
              ].map(({ label, href }) => (
                <a key={label} href={href}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase hover:text-white transition-colors"
                  style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.5)' }}>
                  <IconArrowRight size={10} strokeWidth={3} />{label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="p-4 sm:p-5" style={{ borderRight: '3px solid rgba(255,255,255,0.15)' }}>
            <p className="text-xs font-black uppercase mb-3" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#FF44AA' }}>CONTACT_US</p>
            <div className="space-y-3">
              <a href={`mailto:${event.email}`}
                className="flex items-start gap-2 text-xs hover:text-white transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--y2k-font-ui)' }}>
                <div className="w-6 h-6 flex items-center justify-center shrink-0" style={{ background: '#CCFF00', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                  <IconMail size={12} strokeWidth={3} color="#001A6E" />
                </div>
                <span className="break-all leading-relaxed">{event.email}</span>
              </a>
              <a href={`tel:${event.phone}`}
                className="flex items-center gap-2 text-xs hover:text-white transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--y2k-font-ui)' }}>
                <div className="w-6 h-6 flex items-center justify-center shrink-0" style={{ background: '#00CCFF', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                  <IconPhone size={12} strokeWidth={3} color="#001A6E" />
                </div>
                {event.phone}
              </a>
            </div>
          </div>

          {/* Organizer */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <p className="text-xs font-black uppercase mb-3" style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.4)' }}>ORGANIZED_BY</p>
            <div className="space-y-2">
              {[event.organizer, event.coOrganizer].map((org, i) => (
                <div key={org} className="flex items-center gap-2 px-2 py-1.5"
                  style={{ background: i === 0 ? '#CCFF00' : '#00CCFF', border: '2px solid rgba(255,255,255,0.3)' }}>
                  <IconStar size={10} strokeWidth={3} color="#001A6E" />
                  <span className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>{org}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-5 mt-0"
          style={{ borderTop: '2px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-black uppercase text-center sm:text-left" style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.3)' }}>
            MADE W/ ❤️ BY {event.organizer} TECH TEAM
          </p>
          <p className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.3)' }}>
            © 2025 {event.name}. ALL RIGHTS RESERVED
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
