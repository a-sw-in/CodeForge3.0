'use client';

import { motion } from 'framer-motion';
import { IconMail, IconPhone, IconBrandInstagram, IconBrandGithub, IconBrandTwitter, IconBrandLinkedin } from '@tabler/icons-react';
import data from '@/data/hackathon.json';

const { event } = data;
const SPRING = { type: 'spring', stiffness: 300, damping: 24 };

export default function ContactPage() {
  return (
    <div className="relative w-full min-h-screen" style={{ background: '#00CCFF' }}>
      {/* Diagonal texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 12px)' }} />

      {/* Back to Home Button */}
      <div className="relative z-20 pt-6 px-4 md:px-8">
        <motion.a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2 font-bold uppercase text-xs"
          style={{
            fontFamily: 'var(--y2k-font-ui)',
            background: '#FFFFFF',
            color: '#001A6E',
            border: '3px solid #001A6E',
            letterSpacing: '0.08em',
            boxShadow: '3px 3px 0px #001A6E',
          }}
          whileHover={{ x: -2, y: -2, boxShadow: '5px 5px 0px #001A6E' }}
          whileTap={{ x: 1, y: 1, boxShadow: '1px 1px 0px #001A6E' }}
        >
          ← Back to Home
        </motion.a>
      </div>

      {/* Contact Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Header Window */}
        <motion.div className="mb-10"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={SPRING}>
          <div style={{ border: '3px solid #001A6E', background: '#FFFFFF', boxShadow: '6px 6px 0px #001A6E' }}>
            <div className="flex items-center gap-2 px-3 py-2"
              style={{ background: 'linear-gradient(90deg, #0055FF 0%, #0033AA 100%)', borderBottom: '3px solid #001A6E' }}>
              <span className="flex-1 font-black text-xs uppercase tracking-widest text-white truncate"
                style={{ fontFamily: 'var(--y2k-font-mono)' }}>
                contact_us.exe
              </span>
            </div>
            <div className="px-6 py-6">
              <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-3"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '-0.02em' }}>
                GET IN<br />TOUCH
              </h1>
              <p className="text-sm" style={{ color: '#64748B', fontFamily: 'var(--y2k-font-ui)' }}>
                Have questions? Reach out to the {event.organizer} team
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.1 }}>
            <div style={{ border: '3px solid #001A6E', background: '#FFFFFF', boxShadow: '4px 4px 0px #001A6E' }}>
              <div className="flex items-center gap-3 px-4 py-3"
                style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
                <div className="w-8 h-8 flex items-center justify-center"
                  style={{ background: '#001A6E' }}>
                  <IconMail size={18} color="#CCFF00" strokeWidth={2.5} />
                </div>
                <span className="font-black text-sm uppercase"
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                  Email
                </span>
              </div>
              <div className="p-4">
                <a href={`mailto:${event.email}`}
                  className="text-sm font-bold break-all hover:underline"
                  style={{ color: '#0055FF', fontFamily: 'var(--y2k-font-ui)' }}>
                  {event.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.15 }}>
            <div style={{ border: '3px solid #001A6E', background: '#FFFFFF', boxShadow: '4px 4px 0px #001A6E' }}>
              <div className="flex items-center gap-3 px-4 py-3"
                style={{ background: '#FF44AA', borderBottom: '3px solid #001A6E' }}>
                <div className="w-8 h-8 flex items-center justify-center"
                  style={{ background: '#001A6E' }}>
                  <IconPhone size={18} color="#FF44AA" strokeWidth={2.5} />
                </div>
                <span className="font-black text-sm uppercase text-white"
                  style={{ fontFamily: 'var(--y2k-font-ui)' }}>
                  Phone
                </span>
              </div>
              <div className="p-4">
                <a href={`tel:${event.phone}`}
                  className="text-sm font-bold hover:underline"
                  style={{ color: '#0055FF', fontFamily: 'var(--y2k-font-ui)' }}>
                  {event.phone}
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.2 }}>
          <div style={{ border: '3px solid #001A6E', background: '#FFFFFF', boxShadow: '5px 5px 0px #001A6E' }}>
            <div className="flex items-center gap-3 px-4 py-3"
              style={{ background: '#0055FF', borderBottom: '3px solid #001A6E' }}>
              <span className="font-black text-sm uppercase text-white"
                style={{ fontFamily: 'var(--y2k-font-ui)' }}>
                Follow Us
              </span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: IconBrandInstagram, label: 'Instagram', color: '#E4405F', link: event.social.instagram },
                  { icon: IconBrandGithub, label: 'GitHub', color: '#181717', link: event.social.github },
                  { icon: IconBrandTwitter, label: 'Twitter', color: '#1DA1F2', link: event.social.twitter },
                  { icon: IconBrandLinkedin, label: 'LinkedIn', color: '#0A66C2', link: event.social.linkedin },
                ].map(({ icon: Icon, label, color, link }) => (
                  <a key={label} href={link}
                    className="flex flex-col items-center gap-2 p-4 hover:scale-105 transition-transform"
                    style={{ border: '2px solid #001A6E', background: '#F8FAFC' }}>
                    <div className="w-10 h-10 flex items-center justify-center"
                      style={{ background: color, border: '2px solid #001A6E' }}>
                      <Icon size={20} color="#FFFFFF" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-black uppercase"
                      style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Location Info */}
        <motion.div className="mt-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2" style={{ background: '#001A6E', border: '1px solid #001A6E' }} />
            <p className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>
              {event.location} · {event.dateDisplay}
            </p>
            <div className="w-2 h-2" style={{ background: '#001A6E', border: '1px solid #001A6E' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
