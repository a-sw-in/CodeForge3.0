'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  IconBrandInstagram,
  IconBrandGithub,
  IconBrandX,
  IconBrandLinkedin,
  IconPhone,
  IconMail,
  IconArrowRight,
  IconStar,
} from '@tabler/icons-react';

const SPRING = { type: 'spring', stiffness: 300, damping: 24 };

/* ── Y2K "Concert Poster" footer ──
   Split design:
   Top: big poster-style CTA zone — dark navy, giant CODEFORGE in stacked type,
        with a lime accent band running diagonally
   Bottom: info grid — social links, contact, tech credits in a tight Y2K grid
*/

const Footer = () => {
  const reduce = useReducedMotion();

  return (
    <footer className="relative overflow-hidden" style={{ background: '#001A6E' }}>
      {/* ── POSTER ZONE ── */}
      <div className="relative overflow-hidden" style={{ borderBottom: '4px solid #CCFF00' }}>
        {/* Diagonal lime stripe */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(105deg, transparent 55%, #d0ff15ff 55%, #CCFF00 65%, transparent 65%)',
          zIndex: 0,
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center lg:items-end gap-8 justify-between">
          {/* Left: giant type */}
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            transition={SPRING} viewport={{ once: true }}>
            <div className="inline-block px-3 py-1 mb-4 text-xs font-black uppercase tracking-widest"
              style={{ background: '#FF44AA', fontFamily: 'var(--y2k-font-mono)', color: '#FFFFFF' }}>
              IEEE SB UCEK × IEEE RAS SB UCEK
            </div>
            <h2 className="text-8xl md:text-[130px] font-black uppercase leading-none"
              style={{ fontFamily: 'var(--y2k-font-display)', color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: '0.88' }}>
              CODE<br />FORGE<br />
              <span style={{ color: '#CCFF00' }}>3.0</span>
            </h2>
          </motion.div>

          {/* Right: registration CTA box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.15 }} viewport={{ once: true }}
            className="shrink-0">
            <div style={{ border: '3px solid #CCFF00', background: '#ffffffff', boxShadow: '6px 6px 0px rgba(255,255,255,0.3)' }}>
              {/* Titlebar-style top */}
              <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '3px solid #001A6E' }}>
                <span className="font-black text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>register.exe</span>
                <div className="w-4 h-4 bg-white flex items-center justify-center font-black text-xs" style={{ border: '1.5px solid #001A6E', color: '#001A6E' }}>✕</div>
              </div>
              <div className="px-6 py-5">
                <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>
                  24 HOUR HACKATHON
                </p>
                <p className="text-3xl font-black uppercase leading-tight mb-4" style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>
                  JULY 2025<br />UCEK · KANNUR
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
      <motion.div className="max-w-6xl mx-auto px-6 py-10"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }} viewport={{ once: true }}>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0" style={{ border: '3px solid rgba(255,255,255,0.15)' }}>

          {/* Social */}
          <div className="p-5" style={{ borderRight: '3px solid rgba(255,255,255,0.15)' }}>
            <p className="text-xs font-black uppercase mb-4" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#CCFF00' }}>
              FOLLOW_US
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { Icon: IconBrandInstagram, c: '#FF44AA', label: 'IG' },
                { Icon: IconBrandGithub, c: '#CCFF00', label: 'GH' },
                { Icon: IconBrandX, c: '#FFFFFF', label: 'X' },
                { Icon: IconBrandLinkedin, c: '#00CCFF', label: 'LI' },
              ].map(({ Icon, c, label }) => (
                <motion.a key={label} href="#"
                  className="w-10 h-10 flex items-center justify-center"
                  style={{ background: c, border: '2px solid rgba(255,255,255,0.3)' }}
                  whileHover={{ y: -3, boxShadow: `0 6px 0px rgba(255,255,255,0.2)`, transition: { duration: 0.15 } }}
                  target="_blank" rel="noopener noreferrer">
                  <Icon size={18} strokeWidth={2.5} color="#001A6E" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="p-5" style={{ borderRight: '3px solid rgba(255,255,255,0.15)' }}>
            <p className="text-xs font-black uppercase mb-4" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#00CCFF' }}>
              QUICK_LINKS
            </p>
            <div className="space-y-1.5">
              {['Home', 'About', 'Schedule', 'FAQ', 'Register'].map(link => (
                <a key={link}
                  href={`#${link.toLowerCase() === 'register' ? 'register-section' : link.toLowerCase() === 'about' ? 'about-section' : link.toLowerCase()}`}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase transition-colors hover:text-white"
                  style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.5)' }}>
                  <IconArrowRight size={10} strokeWidth={3} />
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="p-5" style={{ borderRight: '3px solid rgba(255,255,255,0.15)' }}>
            <p className="text-xs font-black uppercase mb-4" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#FF44AA' }}>
              CONTACT_US
            </p>
            <div className="space-y-3">
              <a href="mailto:ieeesbucek@gmail.com"
                className="flex items-start gap-2 text-xs transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--y2k-font-ui)' }}>
                <div className="w-6 h-6 flex items-center justify-center shrink-0" style={{ background: '#CCFF00', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                  <IconMail size={12} strokeWidth={3} color="#001A6E" />
                </div>
                <span className="leading-relaxed">ieeesbucek<br />@gmail.com</span>
              </a>
              <a href="tel:+917907977205"
                className="flex items-center gap-2 text-xs transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--y2k-font-ui)' }}>
                <div className="w-6 h-6 flex items-center justify-center shrink-0" style={{ background: '#00CCFF', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                  <IconPhone size={12} strokeWidth={3} color="#001A6E" />
                </div>
                +91 79079 77205
              </a>
            </div>
          </div>

          {/* Badge / org */}
          <div className="p-5 flex flex-col justify-between">
            <p className="text-xs font-black uppercase mb-4" style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.4)' }}>
              ORGANIZED_BY
            </p>
            <div className="space-y-2">
              {['IEEE SB UCEK', 'IEEE RAS SB UCEK'].map((org, i) => (
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-6 mt-0"
          style={{ borderTop: '2px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.3)' }}>
            MADE W/ ❤️ BY IEEE SB UCEK TECH TEAM
          </p>
          <p className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: 'rgba(255,255,255,0.3)' }}>
            © 2025 CODEFORGE 3.0. ALL RIGHTS RESERVED
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
