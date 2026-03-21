'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IconBell } from '@tabler/icons-react';

export default function NotificationBell() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Fetch announcements (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/announcements');
        const data = await response.json();
        if (data.success) {
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Optional: Refresh announcements every 30 seconds
    const interval = setInterval(fetchAnnouncements, 30000);
    return () => clearInterval(interval);
  }, [isClient]);

  const hasAnnouncements = announcements.length > 0;

  const handleBellClick = () => {
    router.push('/dashboard');
  };

  return (
    <>
      {/* Bell Button - Fixed Position Left of Login */}
      <motion.div
        className="fixed top-5 right-24 z-40"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.3 }}
      >
        <motion.button
          onClick={handleBellClick}
          className="relative inline-flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '40px',
            height: '40px',
            background: '#CCFF00',
            border: '3px solid #001A6E',
            cursor: 'pointer',
            borderRadius: '4px',
            boxShadow: '2px 2px 0px #001A6E',
          }}
        >
          <IconBell size={20} strokeWidth={3} color="#001A6E" />

          {/* Notification Badge */}
          {hasAnnouncements && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 flex items-center justify-center"
              style={{
                width: '24px',
                height: '24px',
                background: '#FF44AA',
                border: '2px solid #001A6E',
                borderRadius: '50%',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                fontFamily: 'var(--y2k-font-ui)',
              }}
            >
              {announcements.length}
            </motion.div>
          )}
        </motion.button>
      </motion.div>
    </>
  );
}
