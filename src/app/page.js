'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { isValidSessionStructure, sanitizeObject, detectXSS } from '@/lib/security';
import LoginButton from './components/LoginButton';
import HomeLoggedIn from './components/HomeLoggedIn';
import HomeLoggedOut from './components/HomeLoggedOut';

export default function UHackathonLanding() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Check for active session and validate against database
    const checkSession = async () => {
      const sessionData = localStorage.getItem('teamSession');
      if (sessionData) {
        try {
          const parsedSession = JSON.parse(sessionData);
          
          // Security validation: Check session structure
          if (!isValidSessionStructure(parsedSession)) {
            console.error('Invalid session structure detected');
            localStorage.removeItem('teamSession');
            setSession(null);
            setShowDashboard(false);
            setLoading(false);
            return;
          }
          
          // Security validation: Check for XSS attempts
          if (detectXSS(JSON.stringify(parsedSession))) {
            console.error('XSS attempt detected in session data');
            localStorage.removeItem('teamSession');
            setSession(null);
            setShowDashboard(false);
            setLoading(false);
            return;
          }
          
          // Sanitize session data
          const sanitizedSession = sanitizeObject(parsedSession);
          
          // Validate session against database
          const { data: teamData, error } = await supabase
            .from('teams')
            .select('team_id, team_name, leader_email, total_members, approved')
            .eq('leader_email', sanitizedSession.leaderEmail)
            .single();
          
          if (teamData && !error) {
            // Team still exists in database - update session with latest data
            const updatedSession = {
              teamId: teamData.team_id,
              teamName: teamData.team_name,
              leaderEmail: teamData.leader_email,
              totalMembers: teamData.total_members,
              approved: Boolean(teamData.approved)
            };
            setSession(updatedSession);
          } else {
            // Team deleted from database, clear session
            localStorage.removeItem('teamSession');
            setSession(null);
            setShowDashboard(false);
          }
        } catch (err) {
          // Invalid session data, clear it
          console.error('Session validation error:', err);
          localStorage.removeItem('teamSession');
          setSession(null);
          setShowDashboard(false);
        }
      } else {
        setShowDashboard(false);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for session changes
    window.addEventListener('sessionUpdate', checkSession);
    window.addEventListener('storage', checkSession);

    return () => {
      window.removeEventListener('sessionUpdate', checkSession);
      window.removeEventListener('storage', checkSession);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background shapes */}
        <motion.div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="absolute top-20 left-10 w-32 h-32 border border-purple-500/30 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div 
            className="absolute top-40 right-20 w-20 h-20 border border-purple-400/40 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-40 left-20 w-16 h-16 bg-purple-600/20 rounded-full"
            animate={{ 
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Loading content */}
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Spinner */}
          <motion.div
            className="w-16 h-16 mx-auto mb-6 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Loading text */}
          <motion.div
            className="text-purple-300 text-lg font-semibold"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Loading...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <LoginButton />
      {showDashboard && session ? (
        <HomeLoggedIn 
          session={session} 
          onBack={() => setShowDashboard(false)} 
        />
      ) : (
        <HomeLoggedOut 
          session={session} 
          onDashboard={() => setShowDashboard(true)} 
        />
      )}
    </>
  );
}
