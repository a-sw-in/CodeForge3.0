'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SponsorsCarousel from '../components/SponsorsCarousel';
import BreakCommercial from '../components/BreakCommercial';

/* ─── Star Burst ─── */
function StarBurst({ color = '#CCFF00', size = 140, style = {} }) {
  const pts = '50,2 59,29 81,15 70,40 97,34 79,55 100,50 79,45 97,66 70,60 81,85 59,71 50,98 41,71 19,85 30,60 3,66 21,45 0,50 21,55 3,34 30,40 19,15 41,29';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style} aria-hidden="true">
      <polygon points={pts} fill={color} />
    </svg>
  );
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [eventStarted, setEventStarted] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverOffset, setServerOffset] = useState(0);

  // Fetch server time and calculate offset
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const response = await fetch('/api/timer');
        const data = await response.json();
        
        if (data.success) {
          const serverTime = new Date(data.serverTime).getTime();
          const clientTime = Date.now();
          const offset = serverTime - clientTime;
          
          setServerOffset(offset);
          setEventStarted(data.eventStarted || data.hasEnded);
          setTimerActive(data.timerActive);
          setIsPaused(data.isPaused);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to sync with server:', error);
        setLoading(false);
      }
    };

    syncWithServer();
    // Re-sync every 5 minutes to maintain accuracy
    const syncInterval = setInterval(syncWithServer, 5 * 60 * 1000);

    return () => clearInterval(syncInterval);
  }, []);

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = async () => {
      try {
        const response = await fetch('/api/timer');
        const data = await response.json();
        
        if (data.success) {
          setIsPaused(data.isPaused);
          setTimerActive(data.timerActive);
          
          if (data.eventStarted || data.hasEnded) {
            setEventStarted(true);
            return;
          }

          // Check if timer hasn't started yet
          if (!data.timerActive) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
          }

          const remaining = data.timeRemaining;
          
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
        }
      } catch (error) {
        console.error('Failed to update countdown:', error);
      }
    };

    if (!loading) {
      updateCountdown();
      // Update every second, the server will handle pause state
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0055FF' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4 mx-auto"
            style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }}></div>
          <div className="font-bold uppercase text-xl" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#FFFFFF', letterSpacing: '0.1em' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start pt-12 px-4 md:px-6" style={{ background: '#0055FF' }}>
      {/* Break Commercial Overlay */}
      <BreakCommercial isVisible={isPaused} />

      {/* Y2K Background decorations - Star Bursts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <StarBurst size={120} color="#CCFF00" style={{ position: 'absolute', top: '8%', left: '5%', opacity: 0.8 }} />
        <StarBurst size={90} color="#CCFF00" style={{ position: 'absolute', bottom: '15%', left: '10%', opacity: 0.75 }} />
        <StarBurst size={160} color="#CCFF00" style={{ position: 'absolute', top: '6%', right: '4%', opacity: 0.9 }} />
        <StarBurst size={100} color="#CCFF00" style={{ position: 'absolute', bottom: '10%', right: '8%', opacity: 0.7 }} />
      </div>

      {/* Main Content */}
      <motion.div
        className="max-w-6xl w-full z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Title */}
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            className="inline-block px-8 py-4"
            style={{
              background: '#CCFF00',
              border: '3px solid #001A6E',
              boxShadow: '8px 8px 0px #001A6E',
            }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase" 
              style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.05em' }}>
              CodeForge 3.0
            </h1>
          </motion.div>
        </div>

        {/* Countdown Display */}
        {!timerActive && !eventStarted ? (
          <motion.div
            className="text-center mt-[10vh]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <div className="inline-block px-12 py-8"
              style={{
                background: '#CCFF00',
                border: '3px solid #001A6E',
                boxShadow: '8px 8px 0px #001A6E',
              }}>
              <p className="text-3xl md:text-4xl font-bold uppercase mb-4"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.05em' }}>
                Event Not Started
              </p>
              <p className="text-lg font-bold uppercase"
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                Countdown begins soon...
              </p>
            </div>
          </motion.div>
        ) : eventStarted ? (
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <div className="inline-block px-12 py-8"
              style={{
                background: '#CCFF00',
                border: '3px solid #001A6E',
                boxShadow: '8px 8px 0px #001A6E',
              }}>
              <p className="text-4xl md:text-5xl font-bold uppercase"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.05em' }}>
                 24 HOURS ENDED!!!!
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {/* Hours */}
            <motion.div
              className="flex mt-[5vh] flex-col items-center"
              style={{
                background: '#FFFFFF',
                border: '3px solid #001A6E',
                boxShadow: '6px 6px 0px #001A6E',
                padding: '1.5rem',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, boxShadow: '8px 8px 0px #001A6E' }}
            >
              <div className="text-5xl md:text-6xl font-bold mb-2"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base font-bold uppercase"
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                Hours
              </div>
            </motion.div>

            {/* Minutes */}
            <motion.div
              className="flex mt-[5vh] flex-col items-center"
              style={{
                background: '#FFFFFF',
                border: '3px solid #001A6E',
                boxShadow: '6px 6px 0px #001A6E',
                padding: '1.5rem',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, boxShadow: '8px 8px 0px #001A6E' }}
            >
              <div className="text-5xl md:text-6xl font-bold mb-2"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base font-bold uppercase"
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                Minutes
              </div>
            </motion.div>

            {/* Seconds */}
            <motion.div
              className="flex mt-[5vh] flex-col items-center"
              style={{
                background: '#CCFF00',
                border: '3px solid #001A6E',
                boxShadow: '6px 6px 0px #001A6E',
                padding: '1.5rem',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4, boxShadow: '8px 8px 0px #001A6E' }}
            >
              <div className="text-5xl md:text-6xl font-bold mb-2"
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base font-bold uppercase"
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                Seconds
              </div>
            </motion.div>
          </div>
        )}

        {/* Server Time Indicator */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
        </motion.div>

        {/* Sponsors Carousel */}
        <SponsorsCarousel />
      </motion.div>
    </div>
  );
}
