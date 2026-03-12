'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeAdminToken } from '@/lib/adminAuth';
import AdminDashboard from './dashboard/DashboardContent';
import AdminControls from './controls/ControlsContent';
import AdminAnnouncements from './announcements/AnnouncementsContent';

export default function AdminPanelTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      removeAdminToken();
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      removeAdminToken();
      router.push('/admin/login');
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'controls', name: 'Timer Controls', icon: '⏱️' },
    { id: 'announcements', name: 'Announcements', icon: '📢' }
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0055FF' }}>
      {/* Y2K Header with Tabs */}
      <div style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar with Branding and Logout */}
          <div className="flex justify-between items-center py-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-2"
                style={{
                  background: '#001A6E',
                  border: '2px solid #001A6E',
                  boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)',
                }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00FF00' }}></div>
                <span className="uppercase tracking-widest text-xs font-bold" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#CCFF00' }}>
                  CodeForge 3.0
                </span>
              </div>
              <h1 className="text-2xl font-bold uppercase" 
                style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.05em' }}>
                Admin Panel
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2 font-bold uppercase text-xs"
              style={{
                fontFamily: 'var(--y2k-font-ui)',
                background: '#FF4444',
                color: '#FFFFFF',
                border: '3px solid #001A6E',
                letterSpacing: '0.08em',
                boxShadow: '3px 3px 0px #001A6E',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.boxShadow = '5px 5px 0px #001A6E'}
              onMouseLeave={(e) => e.target.style.boxShadow = '3px 3px 0px #001A6E'}
            >
              Logout
            </button>
          </div>

          {/* Tab Bar - Y2K Style */}
          <div className="flex gap-2 pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-6 py-3 font-bold uppercase text-xs transition-all"
                style={{
                  fontFamily: 'var(--y2k-font-ui)',
                  background: activeTab === tab.id ? '#001A6E' : 'transparent',
                  color: activeTab === tab.id ? '#CCFF00' : '#001A6E',
                  border: '3px solid #001A6E',
                  borderBottom: activeTab === tab.id ? 'none' : '3px solid #001A6E',
                  letterSpacing: '0.08em',
                  boxShadow: activeTab === tab.id ? '0px -3px 0px #001A6E' : 'none',
                  transform: activeTab === tab.id ? 'translateY(3px)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[calc(100vh-12rem)]">
        {activeTab === 'dashboard' && <AdminDashboard inTabView={true} />}
        {activeTab === 'controls' && <AdminControls inTabView={true} />}
        {activeTab === 'announcements' && <AdminAnnouncements inTabView={true} />}
      </div>
    </div>
  );
}
