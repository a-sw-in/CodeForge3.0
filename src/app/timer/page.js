'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoLink, setVideoLink] = useState('');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState([]);
  const videoRef = useRef(null);

  // Fetch videos from JSON file on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/data/videos.json');
        const data = await response.json();
        if (data.videos && data.videos.length > 0) {
          setVideos(data.videos);
          setVideoLink(data.videos[0].path);
          setCurrentVideoIndex(0);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      }
    };
    fetchVideos();
  }, []);

  // Fetch server time and calculate offset - ONLY ON PAGE LOAD
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const response = await fetch('/api/timer');
        const data = await response.json();
        
        if (data.success) {
          const remaining = data.timeRemaining;
          
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
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
    // Only runs once on mount
  }, []);

  // Connect to SSE stream for real-time timer updates
  useEffect(() => {
    if (loading) return;

    let eventSource = null;

    const connectSSE = () => {
      console.log('[Timer] Attempting SSE connection...');
      eventSource = new EventSource('/api/timer/events');

      eventSource.onopen = () => {
        console.log('✅ SSE Connection established!');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { timerState } = data;

          if (timerState) {
            setTimerActive(timerState.isActive);
            setIsPaused(timerState.isPaused);

            // If timer just was paused/resumed/reset, update the time
            if (timerState.startTime) {
              const now = Date.now();
              const startTime = new Date(timerState.startTime).getTime();
              const endTime = startTime + (24 * 60 * 60 * 1000) + (timerState.accumulatedPauseTime || 0);

              let timeRemaining;
              if (timerState.isPaused) {
                timeRemaining = timerState.pausedTimeRemaining || 0;
              } else {
                timeRemaining = endTime - now;
              }

              const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
              const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

              setTimeLeft({ days, hours, minutes, seconds });
              
              if (timeRemaining <= 0) {
                setEventStarted(true);
              }
            }
          }
        } catch (error) {
          console.error('SSE parsing error:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        eventSource.close();
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        console.log('Closing SSE connection');
        eventSource.close();
      }
    };
  }, [loading]);

  // Client-side countdown between SSE updates
  useEffect(() => {
    if (!timerActive || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        } else {
          setEventStarted(true);
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, isPaused]);

  // Ensure video has audio and volume is set
  useEffect(() => {
    if (videoRef.current && isPlayingVideo) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      // Play video when it changes
      videoRef.current.play().catch(err => console.log('Play error:', err));
    }
  }, [isPlayingVideo, videoLink]);

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

  const handlePlayVideo = () => {
    setIsPlayingVideo(!isPlayingVideo);
    if (!isPlayingVideo) {
      // Fetch videos from JSON
      fetch('/data/videos.json')
        .then(res => res.json())
        .then(data => {
          setVideos(data.videos);
          setCurrentVideoIndex(0);
          setVideoLink(data.videos[0].path);
        })
        .catch(err => console.error('Failed to load videos:', err));
    }
  };

  const handleCloseVideo = () => {
    setIsPlayingVideo(false);
  };

  const handleVideoDoubleClick = (e) => {
    if (!videoRef.current) return;
    
    const rect = videoRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const videoWidth = rect.width;
    const isRightSide = clickX > videoWidth / 2;
    
    const skipAmount = 10; // seconds
    const newTime = isRightSide 
      ? videoRef.current.currentTime + skipAmount 
      : videoRef.current.currentTime - skipAmount;
    
    videoRef.current.currentTime = Math.max(0, newTime);
  };

  // Handle video end - play next video from playlist
  const handleVideoEnd = () => {
    if (videos.length === 0) return;
    
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
    setVideoLink(videos[nextIndex].path);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start pt-12 px-4 md:px-6" style={{ background: '#0055FF' }}>
      {/* Hamburger Menu Button - Top Right - Toggles Video */}
      <motion.button
        onClick={handlePlayVideo}
        className="fixed top-6 right-6 z-50 p-3 rounded-lg transition-all hover:scale-110"
        style={{
          background: isPlayingVideo ? '#CCFF00' : 'rgba(255, 255, 255, 0.9)',
          border: '2px solid #001A6E',
          boxShadow: '4px 4px 0px rgba(0, 26, 110, 0.5)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex flex-col gap-1.5">
          <span className="block w-6 h-0.5" style={{ background: '#001A6E' }}></span>
          <span className="block w-6 h-0.5" style={{ background: '#001A6E' }}></span>
          <span className="block w-6 h-0.5" style={{ background: '#001A6E' }}></span>
        </div>
      </motion.button>

      {/* Video Link Modal - REMOVED */}
      <AnimatePresence>
      </AnimatePresence>

      {/* Video Player Fullscreen */}
      <AnimatePresence>
        {isPlayingVideo && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Exit Button - Top Right */}
            <motion.button
              onClick={handleCloseVideo}
              className="absolute top-6 right-6 z-60 p-2 text-white text-xl font-bold"
              style={{
                background: 'transparent',
              }}
              whileHover={{ scale: 1.2 }}
            >
              ✕
            </motion.button>

            {/* Video Element */}
            <video
              ref={videoRef}
              src={videoLink}
              controls
              autoPlay
              onDoubleClick={handleVideoDoubleClick}
              onEnded={handleVideoEnd}
              className="w-full h-full object-contain cursor-pointer"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              crossOrigin="anonymous"
              playsInline
            />

            {/* Timer Overlay - Bottom Right */}
            <motion.div
              className="absolute bottom-8 right-8 z-60 p-7"
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(8px)',
                imageRendering: 'pixelated',
              }}
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex gap-6">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div style={{ fontSize: '43.2px', fontWeight: 'bold', color: '#CCFF00', fontFamily: 'var(--y2k-font-display)', lineHeight: '1' }}>
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-base font-bold uppercase mt-1" style={{ color: '#CCFF00', fontFamily: 'var(--y2k-font-ui)', letterSpacing: '0.1em' }}>
                    H
                  </div>
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div style={{ fontSize: '43.2px', fontWeight: 'bold', color: '#CCFF00', fontFamily: 'var(--y2k-font-display)', lineHeight: '1' }}>
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-base font-bold uppercase mt-1" style={{ color: '#CCFF00', fontFamily: 'var(--y2k-font-ui)', letterSpacing: '0.1em' }}>
                    M
                  </div>
                </div>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div style={{ fontSize: '43.2px', fontWeight: 'bold', color: '#CCFF00', fontFamily: 'var(--y2k-font-display)', lineHeight: '1' }}>
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-base font-bold uppercase mt-1" style={{ color: '#CCFF00', fontFamily: 'var(--y2k-font-ui)', letterSpacing: '0.1em' }}>
                    S
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                style={{ fontFamily:'var(--y2k-font-ui)', color: '#001A6E' }}>
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
