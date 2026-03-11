'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setAdminToken, hasAdminToken } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (hasAdminToken()) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setAdminToken(data.token);
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="admin-container" style={{ background: '#0055FF' }}>
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Y2K Window Card */}
          <div className="flex flex-col"
            style={{
              border: '3px solid #001A6E',
              background: '#FFFFFF',
              boxShadow: '8px 8px 0px #001A6E',
            }}>
            {/* Window Title Bar */}
            <div className="flex items-center justify-between px-4 py-2"
              style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
              <span className="font-bold text-sm uppercase tracking-wide" 
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                🔐 Admin Login
              </span>
              <div className="flex items-center justify-center w-5 h-5"
                style={{ background: '#FFFFFF', border: '2px solid #001A6E' }}>
                <span className="text-xs font-bold" style={{ color: '#001A6E' }}>✕</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                {/* IEEE Badge - Y2K Style */}
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-3"
                  style={{
                    background: '#CCFF00',
                    border: '3px solid #001A6E',
                    boxShadow: '3px 3px 0px #001A6E',
                  }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00FF00' }}></div>
                  <span className="uppercase tracking-widest text-xs font-bold" 
                    style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                    IEEE SB UCEK
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold mb-2 uppercase" 
                  style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  CodeForge 3.0
                </h1>
                <p className="text-base font-bold uppercase mb-1" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#0055FF', letterSpacing: '0.05em' }}>
                  Admin Panel
                </p>
                <p className="text-sm font-medium" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B' }}>
                  Sign in to access the dashboard
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3"
                  style={{ 
                    background: '#FEE2E2', 
                    border: '3px solid #EF4444',
                    boxShadow: '3px 3px 0px #001A6E'
                  }}>
                  <p className="text-sm text-center font-medium" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#991B1B' }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-xs font-bold uppercase mb-2" 
                    style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="Enter username"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '4px 4px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase mb-2" 
                    style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="Enter password"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '4px 4px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 font-bold uppercase text-sm"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: loading ? '#94A3B8' : '#CCFF00',
                    color: '#001A6E',
                    border: '3px solid #001A6E',
                    letterSpacing: '0.08em',
                    boxShadow: loading ? '3px 3px 0px #001A6E' : '4px 4px 0px #001A6E',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.boxShadow = '6px 6px 0px #001A6E')}
                  onMouseLeave={(e) => !loading && (e.target.style.boxShadow = '4px 4px 0px #001A6E')}
                  onMouseDown={(e) => !loading && (e.target.style.boxShadow = '2px 2px 0px #001A6E')}
                  onMouseUp={(e) => !loading && (e.target.style.boxShadow = '6px 6px 0px #001A6E')}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: '#001A6E', borderTopColor: 'transparent' }}></div>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Info */}
              <div className="mt-6 pt-6" style={{ borderTop: '3px solid #E2E8F0' }}>
                <p className="text-center text-xs font-bold uppercase" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#94A3B8', letterSpacing: '0.1em' }}>
                  🔒 Secure Admin Access Only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
