'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

export default function HomeLoggedIn({ session, onBack }) {
  const isApproved = Boolean(session?.approved);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Fetch announcements from database
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');
        const data = await response.json();
        
        if (data.success) {
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Helper function to get announcement style based on type
  const getAnnouncementStyle = (type) => {
    switch (type) {
      case 'warning':
        return {
          background: '#FFF7ED',
          border: '3px solid #FBBF24'
        };
      case 'success':
        return {
          background: '#F0FDF4',
          border: '3px solid #34D399'
        };
      case 'info':
      default:
        return {
          background: '#F0F9FF',
          border: '3px solid #0055FF'
        };
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 md:px-6 pt-24 md:pt-28 pb-12 md:pb-16" style={{ background: '#0055FF' }}>
      {/* Watermark Background */}
      <Watermark />
      {/* Back Button - Top Left - Y2K Style */}
      <motion.button
        onClick={onBack}
        className="fixed top-10 left-4 md:left-8 z-20 inline-flex items-center gap-2 px-4 py-2 cursor-pointer"
        style={{
          background: '#CCFF00',
          border: '3px solid #001A6E',
          boxShadow: '4px 4px 0px #001A6E',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0px #001A6E' }}
        whileTap={{ x: 1, y: 1, boxShadow: '2px 2px 0px #001A6E' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#001A6E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <p className="uppercase text-xs font-bold tracking-wider" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
          Back
        </p>
      </motion.button>

      {/* Y2K Background decorations - Star Bursts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <StarBurst size={120} color="#CCFF00" style={{ position: 'absolute', top: '8%', left: '5%', opacity: 0.8 }} />
        <StarBurst size={90} color="#CCFF00" style={{ position: 'absolute', bottom: '15%', left: '10%', opacity: 0.75 }} />
        <StarBurst size={160} color="#CCFF00" style={{ position: 'absolute', top: '6%', right: '4%', opacity: 0.9 }} />
        <StarBurst size={100} color="#CCFF00" style={{ position: 'absolute', bottom: '10%', right: '8%', opacity: 0.7 }} />
      </div>

      {/* Main Content */}
      <motion.div
        className="max-w-5xl w-full z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Welcome Header - Y2K Style */}
        <div className="text-center mb-8 md:mb-12 mt-8 md:mt-12">
          <motion.div
            className="inline-block mb-4 px-6 py-3"
            style={{
              background: '#CCFF00',
              border: '3px solid #001A6E',
              boxShadow: '6px 6px 0px #001A6E',
            }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase" style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.05em' }}>
              Welcome!
            </h1>
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold uppercase mb-3" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#CCFF00', letterSpacing: '0.08em' }}>
            {session.teamName}
          </h2>
          <p className="text-sm md:text-base font-bold uppercase" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#FFFFFF', letterSpacing: '0.1em' }}>
            Ready for CodeForge 3.0
          </p>
        </div>

        {/* Dashboard Cards - Y2K Window Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Team Info Card */}
          <motion.div
            className="flex flex-col"
            style={{
              border: '3px solid #001A6E',
              background: '#FFFFFF',
              boxShadow: '6px 6px 0px #001A6E',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4, boxShadow: '8px 8px 0px #001A6E' }}
          >
            {/* Window Title Bar */}
            <div className="flex items-center justify-between px-3 py-2"
              style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
              <span className="font-bold text-xs uppercase tracking-wide" 
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                 Team Info
              </span>
              <div className="flex items-center justify-center w-4 h-4"
                style={{ background: '#FFFFFF', border: '2px solid #001A6E' }}>
                <span className="text-xs font-bold" style={{ color: '#001A6E' }}>✕</span>
              </div>
            </div>
            {/* Content */}
            <div className="p-4">
              <p className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                Team: <span className="font-normal">{session.teamName}</span>
              </p>
              <p className="text-sm font-bold" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                Members: <span className="font-normal">{session.totalMembers}</span>
              </p>
            </div>
          </motion.div>

          {/* Event Status Card */}
          <motion.div
            className="flex flex-col"
            style={{
              border: '3px solid #001A6E',
              background: '#FFFFFF',
              boxShadow: '6px 6px 0px #001A6E',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -4, boxShadow: '8px 8px 0px #001A6E' }}
          >
            {/* Window Title Bar */}
            <div className="flex items-center justify-between px-3 py-2"
              style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
              <span className="font-bold text-xs uppercase tracking-wide" 
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                 Event Status
              </span>
              <div className="flex items-center justify-center w-4 h-4"
                style={{ background: '#FFFFFF', border: '2px solid #001A6E' }}>
                <span className="text-xs font-bold" style={{ color: '#001A6E' }}>✕</span>
              </div>
            </div>
            {/* Content */}
            <div className="p-4">
              <p className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                Registration
              </p>
              <p className="text-sm font-bold" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                Status: <span className="font-normal" style={{ color: isApproved ? '#00AA00' : '#D97706' }}>{isApproved ? 'Ready' : 'Pending'}</span>
              </p>
            </div>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div
            className="flex flex-col"
            style={{
              border: '3px solid #001A6E',
              background: '#FFFFFF',
              boxShadow: '6px 6px 0px #001A6E',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -4, boxShadow: '8px 8px 0px #001A6E' }}
          >
            {/* Window Title Bar */}
            <div className="flex items-center justify-between px-3 py-2"
              style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
              <span className="font-bold text-xs uppercase tracking-wide" 
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                 Quick Actions
              </span>
              <div className="flex items-center justify-center w-4 h-4"
                style={{ background: '#FFFFFF', border: '2px solid #001A6E' }}>
                <span className="text-xs font-bold" style={{ color: '#001A6E' }}>✕</span>
              </div>
            </div>
            {/* Content */}
            <div className="p-4">
              <motion.a
                href="/schedule"
                className="block w-full py-2.5 font-bold uppercase text-xs text-center"
                style={{
                  fontFamily: 'var(--y2k-font-ui)',
                  background: '#CCFF00',
                  color: '#001A6E',
                  border: '3px solid #001A6E',
                  letterSpacing: '0.08em',
                  boxShadow: '3px 3px 0px #001A6E',
                }}
                whileHover={{ x: -2, y: -2, boxShadow: '5px 5px 0px #001A6E' }}
                whileTap={{ x: 1, y: 1, boxShadow: '1px 1px 0px #001A6E' }}
              >
                View Schedule
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Notice Board - Y2K Window Style */}
        <motion.div
          className="mt-6 md:mt-8 flex flex-col"
          style={{
            border: '3px solid #001A6E',
            background: '#FFFFFF',
            boxShadow: '6px 6px 0px #001A6E',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {/* Window Title Bar */}
          <div className="flex items-center justify-between px-3 py-2"
            style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
            <span className="font-bold text-xs uppercase tracking-wide" 
              style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
               Announcements
            </span>
            <div className="flex items-center justify-center w-4 h-4"
              style={{ background: '#FFFFFF', border: '2px solid #001A6E' }}>
              <span className="text-xs font-bold" style={{ color: '#001A6E' }}>✕</span>
            </div>
          </div>
          {/* Content */}
          <div className="p-4 md:p-6 space-y-3">
            {loadingAnnouncements ? (
              <div className="p-3 md:p-4 text-center"
                style={{ 
                  background: '#F0F9FF', 
                  border: '3px solid #0055FF',
                  boxShadow: '3px 3px 0px #001A6E'
                }}>
                <p className="text-xs md:text-sm font-medium" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                  Loading announcements...
                </p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-3 md:p-4 text-center"
                style={{ 
                  background: '#F0F9FF', 
                  border: '3px solid #0055FF',
                  boxShadow: '3px 3px 0px #001A6E'
                }}>
                <p className="text-xs md:text-sm font-medium" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                  No announcements at this time.
                </p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="p-3 md:p-4"
                  style={{ 
                    ...getAnnouncementStyle(announcement.type),
                    boxShadow: '3px 3px 0px #001A6E'
                  }}
                >
                  <p className="text-xs md:text-sm font-medium" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                    {announcement.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
