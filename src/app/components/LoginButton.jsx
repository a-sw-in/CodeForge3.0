'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { IconLogin, IconUserCircle, IconLogout, IconUser, IconArrowRight, IconChevronDown } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const BOUNCE = { type: 'spring', stiffness: 400, damping: 18 };

export default function LoginButton() {
  const reduce = useReducedMotion();
  const [session, setSession] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const sessionData = localStorage.getItem('teamSession');
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData);
        if (parsedSession.leaderEmail) {
          try {
            const { data: teamData, error } = await supabase
              .from('teams').select('*').eq('leader_email', parsedSession.leaderEmail).single();
            if (teamData && !error) {
              const members = [
                { name: teamData.leader_name, email: teamData.leader_email, year: teamData.leader_year },
                teamData.member2_name ? { name: teamData.member2_name, email: teamData.member2_email, year: teamData.member2_year } : null,
                teamData.member3_name ? { name: teamData.member3_name, email: teamData.member3_email, year: teamData.member3_year } : null,
                teamData.member4_name ? { name: teamData.member4_name, email: teamData.member4_email, year: teamData.member4_year } : null,
              ].filter(Boolean);
              setSession({ ...parsedSession, teamName: teamData.team_name, totalMembers: teamData.total_members, members });
            } else { setSession(parsedSession); }
          } catch { setSession(parsedSession); }
        } else { setSession(parsedSession); }
      }
    };
    checkSession();
    window.addEventListener('storage', checkSession);
    window.addEventListener('sessionUpdate', checkSession);
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest('.y2k-dropdown')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', checkSession);
      window.removeEventListener('sessionUpdate', checkSession);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogin = () => router.push('/login');
  const handleLogout = () => {
    localStorage.removeItem('teamSession');
    setSession(null);
    setShowDropdown(false);
    window.dispatchEvent(new Event('sessionUpdate'));
    window.location.href = '/';
  };

  const MEMBER_COLORS = ['#CCFF00', '#00CCFF', '#FF44AA', '#FFFFFF'];

  /* ── Logged in ── */
  if (session) {
    return (
      <motion.div className="fixed top-5 right-6 z-50"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ...BOUNCE, delay: reduce ? 0 : 0.3 }}>
        <div className="relative y2k-dropdown">
          <motion.button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white font-black text-sm uppercase"
            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', border: '3px solid #001A6E', boxShadow: '4px 4px 0px #001A6E', letterSpacing: '0.04em' }}
            whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0px #001A6E', transition: { duration: 0.15 } }}
            whileTap={{ x: 1, y: 1, boxShadow: '2px 2px 0px #001A6E' }}>
            <div className="w-6 h-6 flex items-center justify-center text-[#001A6E]" style={{ background: '#CCFF00', border: '2px solid #001A6E' }}>
              <IconUserCircle size={14} strokeWidth={3} />
            </div>
            <span>{session.teamName}</span>
            <motion.div animate={{ rotate: showDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <IconChevronDown size={14} strokeWidth={3} />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={BOUNCE}
                className="absolute top-full right-0 mt-2 w-60 bg-white"
                style={{ border: '3px solid #001A6E', boxShadow: '5px 5px 0px #001A6E' }}>
                {/* Title bar */}
                <div className="flex items-center justify-between px-3 py-2"
                  style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
                  <span className="text-xs font-black uppercase" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>team-members.exe</span>
                  <div className="w-5 h-5 bg-white flex items-center justify-center font-black text-xs" style={{ border: '2px solid #001A6E', cursor: 'pointer', color: '#001A6E' }}>✕</div>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {session.members?.length > 0 ? session.members.map((m, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3"
                      style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <div className="w-7 h-7 flex items-center justify-center text-[#001A6E] shrink-0"
                        style={{ background: MEMBER_COLORS[i % 4], border: '2px solid #001A6E' }}>
                        <IconUser size={13} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="font-black text-sm" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>{m.name}</p>
                        {i === 0 && <span className="text-xs font-black px-2" style={{ background: '#CCFF00', border: '1.5px solid #001A6E', fontFamily: 'var(--y2k-font-mono)', color: '#001A6E' }}>LEADER</span>}
                      </div>
                    </div>
                  )) : (
                    <div className="px-4 py-6 text-center text-sm" style={{ color: '#64748B', fontFamily: 'var(--y2k-font-ui)' }}>No member data</div>
                  )}
                </div>
                <div style={{ borderTop: '3px solid #001A6E' }}>
                  <button onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-2 font-black text-sm uppercase"
                    style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF0F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="w-6 h-6 flex items-center justify-center" style={{ background: '#FF44AA', border: '2px solid #001A6E' }}>
                      <IconLogout size={12} strokeWidth={3} color="#001A6E" />
                    </div>
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  /* ── Login button ── */
  return (
    <motion.div className="fixed top-5 right-6 z-50"
      initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ ...BOUNCE, delay: reduce ? 0 : 0.3 }}>
      <motion.button
        onClick={handleLogin}
        className="flex items-center gap-2 px-4 py-2 font-black text-sm uppercase"
        style={{ fontFamily: 'var(--y2k-font-ui)', background: '#CCFF00', color: '#001A6E', border: '3px solid #001A6E', boxShadow: '4px 4px 0px #001A6E', letterSpacing: '0.04em' }}
        whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0px #001A6E', transition: { duration: 0.15 } }}
        whileTap={{ x: 1, y: 1, boxShadow: '2px 2px 0px #001A6E' }}>
        <IconLogin size={16} strokeWidth={3} />
        Login / Register
        <IconArrowRight size={14} strokeWidth={3} />
      </motion.button>
    </motion.div>
  );
}
