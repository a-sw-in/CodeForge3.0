'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { removeAdminToken, hasAdminToken } from '@/lib/adminAuth';

export default function AdminControls({ inTabView = false }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(inTabView);
  const [loading, setLoading] = useState(!inTabView);
  const [timerStatus, setTimerStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [adjustMinutes, setAdjustMinutes] = useState(5);

  // Check authentication
  useEffect(() => {
    if (inTabView) {
      // Skip auth check when in tab view - parent handles it
      fetchTimerStatus();
      return;
    }

    const checkAuth = async () => {
      if (!hasAdminToken()) {
        router.push('/admin/login');
        return;
      }

      try {
        const response = await fetch('/api/admin/verify');
        const data = await response.json();

        if (data.authenticated) {
          setIsAuthenticated(true);
          await fetchTimerStatus();
        } else {
          removeAdminToken();
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        removeAdminToken();
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, inTabView]);

  // Fetch timer status
  const fetchTimerStatus = async () => {
    try {
      const response = await fetch('/api/admin/timer');
      const data = await response.json();

      if (data.success) {
        setTimerStatus(data.timer);
        
        // Calculate time remaining from server data
        if (data.timer.isActive && data.timer.startTime) {
          const now = Date.now();
          const start = new Date(data.timer.startTime).getTime();
          const end = start + (24 * 60 * 60 * 1000) + (data.timer.accumulatedPauseTime || 0);
          
          let remaining;
          if (data.timer.isPaused && data.timer.pausedTimeRemaining) {
            remaining = data.timer.pausedTimeRemaining;
          } else {
            remaining = Math.max(0, end - now);
          }
          
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          
          setTimeRemaining({ hours, minutes, seconds, totalMs: remaining });
        } else {
          setTimeRemaining(null);
        }
        
        setError('');
      } else {
        setError(data.error || 'Failed to fetch timer status');
      }
    } catch (err) {
      console.error('Fetch timer status error:', err);
      setError('An error occurred while fetching timer status');
    }
  };

  // Update countdown display
  useEffect(() => {
    if (!timerStatus || !timerStatus.isActive) {
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const start = new Date(timerStatus.startTime).getTime();
      const end = start + (24 * 60 * 60 * 1000) + (timerStatus.accumulatedPauseTime || 0);
      
      let remaining;
      if (timerStatus.isPaused && timerStatus.pausedTimeRemaining) {
        // When paused, use the saved time remaining value
        remaining = timerStatus.pausedTimeRemaining;
      } else {
        // When running, calculate from current time
        remaining = Math.max(0, end - now);
      }

      if (remaining === 0 && !timerStatus.isPaused) {
        fetchTimerStatus(); // Refresh status when timer ends
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds, totalMs: remaining });
    };

    updateCountdown();
    
    // Only update interval if not paused
    if (!timerStatus.isPaused) {
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [timerStatus]);

  const handleStartTimer = async () => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTimerStatus();
      } else {
        setError(data.error || 'Failed to start timer');
      }
    } catch (err) {
      console.error('Start timer error:', err);
      setError('An error occurred while starting the timer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopTimer = async () => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTimerStatus();
      } else {
        setError(data.error || 'Failed to stop timer');
      }
    } catch (err) {
      console.error('Stop timer error:', err);
      setError('An error occurred while stopping the timer');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseTimer = async () => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'pause' }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTimerStatus();
      } else {
        setError(data.error || 'Failed to pause timer');
      }
    } catch (err) {
      console.error('Pause timer error:', err);
      setError('An error occurred while pausing the timer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeTimer = async () => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'resume' }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTimerStatus();
      } else {
        setError(data.error || 'Failed to resume timer');
      }
    } catch (err) {
      console.error('Resume timer error:', err);
      setError('An error occurred while resuming the timer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetTimer = async () => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset' }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTimerStatus();
      } else {
        setError(data.error || 'Failed to reset timer');
      }
    } catch (err) {
      console.error('Reset timer error:', err);
      setError('An error occurred while resetting the timer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTime = async () => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'addTime', minutes: adjustMinutes }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTimerStatus();
      } else {
        setError(data.error || 'Failed to add time');
      }
    } catch (err) {
      console.error('Add time error:', err);
      setError('An error occurred while adding time');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubtractTime = async () => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'subtractTime', minutes: adjustMinutes }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTimerStatus();
      } else {
        setError(data.error || 'Failed to subtract time');
      }
    } catch (err) {
      console.error('Subtract time error:', err);
      setError('An error occurred while subtracting time');
    } finally {
      setActionLoading(false);
    }
  };

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

  const navigateToDashboard = () => {
    router.push('/admin/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={inTabView ? "" : "min-h-screen bg-gray-50"}>
      {/* Header */}
      {!inTabView && (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Timer Controls</h1>
                <p className="mt-1 text-sm text-gray-600">Manage the 24-hour hackathon timer</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={navigateToDashboard}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Timer Status Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">24-Hour Timer Status</h2>
            
            {timerStatus ? (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Status:</span>
                  <span className={`px-4 py-2 rounded-full font-semibold ${
                    timerStatus.isPaused
                      ? 'bg-yellow-100 text-yellow-800'
                      : timerStatus.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : timerStatus.hasEnded 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {timerStatus.isPaused ? 'On Break' : timerStatus.isActive ? 'Running' : timerStatus.hasEnded ? 'Ended' : 'Not Started'}
                  </span>
                </div>

                {/* Timer Display */}
                {timerStatus.isActive && timeRemaining && (
                  <div className={`border-2 rounded-lg p-8 ${
                    timerStatus.isPaused ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="text-center">
                      <p className={`text-sm font-medium mb-3 ${
                        timerStatus.isPaused ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {timerStatus.isPaused ? 'Time Remaining (Paused)' : 'Time Remaining'}
                      </p>
                      <div className="flex justify-center gap-4">
                        <div className="bg-white rounded-lg px-6 py-4 shadow-sm">
                          <div className={`text-4xl font-bold ${
                            timerStatus.isPaused ? 'text-yellow-600' : 'text-blue-600'
                          }`}>{String(timeRemaining.hours).padStart(2, '0')}</div>
                          <div className="text-xs text-gray-600 mt-1">HOURS</div>
                        </div>
                        <div className={`flex items-center text-3xl font-bold ${
                          timerStatus.isPaused ? 'text-yellow-600' : 'text-blue-600'
                        }`}>:</div>
                        <div className="bg-white rounded-lg px-6 py-4 shadow-sm">
                          <div className={`text-4xl font-bold ${
                            timerStatus.isPaused ? 'text-yellow-600' : 'text-blue-600'
                          }`}>{String(timeRemaining.minutes).padStart(2, '0')}</div>
                          <div className="text-xs text-gray-600 mt-1">MINUTES</div>
                        </div>
                        <div className={`flex items-center text-3xl font-bold ${
                          timerStatus.isPaused ? 'text-yellow-600' : 'text-blue-600'
                        }`}>:</div>
                        <div className="bg-white rounded-lg px-6 py-4 shadow-sm">
                          <div className={`text-4xl font-bold ${
                            timerStatus.isPaused ? 'text-yellow-600' : 'text-blue-600'
                          }`}>{String(timeRemaining.seconds).padStart(2, '0')}</div>
                          <div className="text-xs text-gray-600 mt-1">SECONDS</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timer Info */}
                {timerStatus.startTime && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Start Time</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {new Date(timerStatus.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">End Time</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {new Date(new Date(timerStatus.startTime).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {timerStatus.hasEnded && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-800 font-semibold">⏰ The 24-hour timer has ended!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Loading timer status...</p>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleStartTimer}
                disabled={actionLoading || (timerStatus && timerStatus.isActive && !timerStatus.isPaused)}
                className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Start Timer'}
              </button>
              
              {timerStatus && timerStatus.isPaused ? (
                <button
                  onClick={handleResumeTimer}
                  disabled={actionLoading}
                  className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? 'Processing...' : 'Resume Timer'}
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  disabled={actionLoading || (timerStatus && (!timerStatus.isActive || timerStatus.isPaused))}
                  className="px-6 py-3 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? 'Processing...' : 'Pause (Break)'}
                </button>
              )}
              
              <button
                onClick={handleStopTimer}
                disabled={actionLoading || (timerStatus && !timerStatus.isActive)}
                className="px-6 py-3 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Stop Timer'}
              </button>
              
              <button
                onClick={handleResetTimer}
                disabled={actionLoading}
                className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Reset Timer'}
              </button>

              <button
                onClick={fetchTimerStatus}
                disabled={actionLoading}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                ↻ Refresh
              </button>
            </div>

            {/* Time Adjustment Controls */}
            {timerStatus && timerStatus.isActive && (
              <div className="mt-6 pt-6 border-t border-gray-300">
                <h3 className="text-center text-sm font-semibold text-gray-700 mb-3">Adjust Timer</h3>
                <div className="flex flex-wrap gap-3 justify-center items-center">
                  <div className="flex items-center gap-2">
                    <label htmlFor="adjustMinutes" className="text-sm font-medium text-gray-700">
                      Minutes:
                    </label>
                    <input
                      id="adjustMinutes"
                      type="number"
                      min="1"
                      max="60"
                      value={adjustMinutes}
                      onChange={(e) => setAdjustMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={handleAddTime}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    + Add Time
                  </button>
                  
                  <button
                    onClick={handleSubtractTime}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    - Subtract Time
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">Add or subtract minutes from the current timer</p>
              </div>
            )}
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p><strong>Note:</strong> The timer runs for exactly 24 hours from the start time (excluding pause time).</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
