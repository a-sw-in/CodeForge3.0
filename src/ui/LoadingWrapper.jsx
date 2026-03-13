'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingUI from './loadingui';

const LoadingWrapper = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsTransitioning(true);
      // Start transition, then hide loading after transition completes
      setTimeout(() => {
        setIsLoading(false);
      }, 750); // Transition duration
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingUI duration={2500} onComplete={() => setIsTransitioning(true)} isTransitioning={isTransitioning} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="main-content"
        initial={{ 
          opacity: 0,
          scale: 0.95,
          filter: "blur(20px)",
          rotateX: 10 
        }}
        animate={{ 
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          rotateX: 0
        }}
        transition={{ 
          duration: 0.75,
          ease: [0.25, 0.46, 0.45, 0.94],
          staggerChildren: 0.1
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingWrapper;
