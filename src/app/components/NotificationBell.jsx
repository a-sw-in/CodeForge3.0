'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IconBell, IconX } from '@tabler/icons-react';

export default function NotificationBell() {
  const [announcements, setAnnouncements] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch announcements
  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Optional: Refresh announcements every 30 seconds
    const interval = setInterval(fetchAnnouncements, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasAnnouncements = announcements.length > 0;

  return (
    <>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
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
          zIndex: 40,
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

      {/* Announcements Modal */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 50 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-96 flex flex-col"
            style={{
              background: '#FFFFFF',
              border: '3px solid #001A6E',
              boxShadow: '8px 8px 0px #001A6E',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{
                background: '#CCFF00',
                borderBottom: '3px solid #001A6E',
              }}
            >
              <h2
                className="font-black text-lg uppercase tracking-widest"
                style={{
                  fontFamily: 'var(--y2k-font-ui)',
                  color: '#001A6E',
                  letterSpacing: '0.08em',
                }}
              >
                ANNOUNCEMENTS
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <IconX size={20} strokeWidth={3} color="#001A6E" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div
                  className="flex items-center justify-center h-32"
                  style={{ color: '#001A6E', fontFamily: 'var(--y2k-font-ui)' }}
                >
                  Loading...
                </div>
              ) : announcements.length === 0 ? (
                <div
                  className="flex items-center justify-center h-32 text-center px-6"
                  style={{ color: '#64748B', fontFamily: 'var(--y2k-font-ui)' }}
                >
                  No announcements yet
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: '#E2E8F0' }}>
                  {announcements.map((announcement, index) => (
                    <motion.div
                      key={announcement.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <h3
                        className="font-black text-base mb-2 uppercase"
                        style={{
                          fontFamily: 'var(--y2k-font-display)',
                          color: '#001A6E',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {announcement.title}
                      </h3>
                      <p
                        className="text-sm mb-2"
                        style={{
                          color: '#475569',
                          fontFamily: 'var(--y2k-font-ui)',
                          lineHeight: '1.5',
                        }}
                      >
                        {announcement.message}
                      </p>
                      <span
                        className="text-xs"
                        style={{
                          color: '#94A3B8',
                          fontFamily: 'var(--y2k-font-mono)',
                        }}
                      >
                        {new Date(announcement.created_at).toLocaleDateString()}{' '}
                        {new Date(announcement.created_at).toLocaleTimeString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
