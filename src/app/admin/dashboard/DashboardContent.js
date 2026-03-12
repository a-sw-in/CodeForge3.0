'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { removeAdminToken, hasAdminToken } from '@/lib/adminAuth';

export default function AdminDashboard({ inTabView = false }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(inTabView);
  const [loading, setLoading] = useState(!inTabView);
  const [teams, setTeams] = useState([]);
  const [statistics, setStatistics] = useState({
    totalTeams: 0,
    totalMembers: 0
  });
  const [error, setError] = useState('');
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTeam, setEditedTeam] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (inTabView) {
      // Skip auth check when in tab view - parent handles it
      fetchTeams();
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
          await fetchTeams();
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

  const fetchTeams = async () => {
    try {
      setRefreshLoading(true);
      const response = await fetch('/api/admin/teams');
      
      if (response.status === 401) {
        removeAdminToken();
        router.push('/admin/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setTeams(data.teams || []);
        setStatistics(data.statistics || { totalTeams: 0, totalMembers: 0 });
        setError('');
      } else {
        setError(data.error || 'Failed to fetch teams');
      }
    } catch (err) {
      console.error('Fetch teams error:', err);
      setError('An error occurred while fetching teams');
    } finally {
      setRefreshLoading(false);
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

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    setEditedTeam({ ...team });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeam(null);
    setEditedTeam(null);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original data
      setEditedTeam({ ...selectedTeam });
    }
    setIsEditing(!isEditing);
  };

  const handleFieldChange = (field, value) => {
    setEditedTeam((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/teams', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedTeam),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update team');
      }

      // Update local state
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.team_id === editedTeam.team_id ? editedTeam : team
        )
      );
      setSelectedTeam(editedTeam);
      setIsEditing(false);
      
      // Optionally refresh teams to ensure data consistency
      await fetchTeams();
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-container" style={{ background: '#0055FF' }}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4 mx-auto"
              style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }}></div>
            <div className="font-bold uppercase text-xl" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#FFFFFF', letterSpacing: '0.1em' }}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-container" style={{ background: inTabView ? 'transparent' : '#0055FF' }}>
      {/* Header - Y2K Style */}
      {!inTabView && (
        <div className={`relative z-20 py-4 ${isModalOpen ? 'hidden' : ''}`}
          style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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
                <h1 className="text-2xl font-bold uppercase mb-1" 
                  style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Admin Dashboard
                </h1>
                <p className="text-xs font-medium" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                  Manage and monitor your hackathon platform
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/admin/controls')}
                  className="px-5 py-2 font-bold uppercase text-xs"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: '#00FF00',
                    color: '#001A6E',
                    border: '3px solid #001A6E',
                    letterSpacing: '0.08em',
                    boxShadow: '3px 3px 0px #001A6E',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.target.style.boxShadow = '5px 5px 0px #001A6E'}
                  onMouseLeave={(e) => e.target.style.boxShadow = '3px 3px 0px #001A6E'}
                >
                  Timer Controls
                </button>
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
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Statistics Cards - Y2K Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col"
            style={{
              border: '3px solid #001A6E',
              background: '#FFFFFF',
              boxShadow: '6px 6px 0px #001A6E',
            }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
              <span className="font-bold text-xs uppercase" 
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                📊 Total Teams
              </span>
            </div>
            <div className="p-6">
              <p className="text-5xl font-bold" style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>
                {statistics.totalTeams}
              </p>
            </div>
          </div>

          <div className="flex flex-col"
            style={{
              border: '3px solid #001A6E',
              background: '#FFFFFF',
              boxShadow: '6px 6px 0px #001A6E',
            }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
              <span className="font-bold text-xs uppercase" 
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                👥 Total Members
              </span>
            </div>
            <div className="p-6">
              <p className="text-5xl font-bold" style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E' }}>
                {statistics.totalMembers}
              </p>
            </div>
          </div>
        </div>

        {/* Teams Section - Y2K Style */}
        <div className="flex flex-col overflow-hidden"
          style={{
            border: '3px solid #001A6E',
            background: '#FFFFFF',
            boxShadow: '6px 6px 0px #001A6E',
          }}>
          <div className="px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
            <h2 className="text-lg font-bold uppercase" 
              style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
              📋 Registered Teams
            </h2>
            <button
              onClick={fetchTeams}
              disabled={refreshLoading}
              className="px-4 py-2 font-bold uppercase text-xs"
              style={{
                fontFamily: 'var(--y2k-font-ui)',
                background: refreshLoading ? '#CBD5E1' : '#001A6E',
                color: '#FFFFFF',
                border: '3px solid #001A6E',
                letterSpacing: '0.08em',
                boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.2)',
                cursor: refreshLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {refreshLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: '#FFFFFF', borderTopColor: 'transparent' }}></div>
                  Refreshing...
                </span>
              ) : (
                'Refresh Data'
              )}
            </button>
          </div>

          {error && (
            <div className="m-6 p-3"
              style={{ 
                background: '#FEE2E2', 
                border: '3px solid #EF4444',
                boxShadow: '3px 3px 0px #001A6E'
              }}>
              <p className="text-sm font-medium" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#991B1B' }}>{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            {teams.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <p className="font-bold uppercase" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B', letterSpacing: '0.05em' }}>
                  No teams registered yet
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '3px solid #E2E8F0' }}>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" 
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                      Team Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" 
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" 
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" 
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                      ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr 
                      key={team.team_id || index}
                      onClick={() => handleTeamClick(team)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '2px solid #E2E8F0' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F0F9FF'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-6 py-4 font-bold text-sm" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                        {team.team_name || team.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#475569' }}>
                        {team.total_members || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#475569' }}>
                        {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono" style={{ color: '#94A3B8' }}>
                        {team.team_id ? team.team_id.substring(0, 8) + '...' : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Team Details Modal - Y2K Style */}
        {isModalOpen && selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 26, 110, 0.85)' }}
            onClick={handleCloseModal}>
            <div className="w-full max-w-4xl max-h-[90vh] overflow-auto"
              style={{
                background: '#FFFFFF',
                border: '3px solid #001A6E',
                boxShadow: '8px 8px 0px #001A6E',
              }}
              onClick={(e) => e.stopPropagation()}>
              {/* Modal Header - Lime Title Bar */}
              <div className="px-6 py-3 flex justify-between items-center"
                style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
                <h3 className="text-xl font-bold uppercase"
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  📄 Team Details
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="w-6 h-6 flex items-center justify-center font-bold text-sm"
                  style={{
                    background: '#001A6E',
                    color: '#FFFFFF',
                    border: '2px solid #001A6E',
                    fontFamily: 'var(--y2k-font-ui)',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6" style={{ background: '#FFFFFF' }}>
                {error && (
                  <div className="mb-4 p-3"
                    style={{
                      background: '#FEE2E2',
                      border: '3px solid #EF4444',
                      boxShadow: '3px 3px 0px #001A6E',
                    }}>
                    <p className="text-sm font-medium" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#991B1B' }}>
                      {error}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Team Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2" 
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={editedTeam?.team_name || ''}
                      onChange={(e) => handleFieldChange('team_name', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-sm font-medium"
                      style={{
                        fontFamily: 'var(--y2k-font-ui)',
                        background: isEditing ? '#FFFFFF' : '#F1F5F9',
                        color: '#001A6E',
                        border: '3px solid #001A6E',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Total Members */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2" 
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                      Total Members
                    </label>
                    <input
                      type="number"
                      value={editedTeam?.total_members || ''}
                      onChange={(e) => handleFieldChange('total_members', parseInt(e.target.value))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-sm font-medium"
                      style={{
                        fontFamily: 'var(--y2k-font-ui)',
                        background: isEditing ? '#FFFFFF' : '#F1F5F9',
                        color: '#001A6E',
                        border: '3px solid #001A6E',
                        outline: 'none',
                      }}
                      min="1"
                      max="4"
                    />
                  </div>

                  {/* Approval Status */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2"
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                      Approval Status
                    </label>
                    <div className="flex items-center gap-3 p-3"
                      style={{
                        background: '#F8FAFC',
                        border: '3px solid #E2E8F0',
                      }}>
                      <input
                        id="approved-checkbox"
                        type="checkbox"
                        checked={Boolean(editedTeam?.approved)}
                        onChange={(e) => handleFieldChange('approved', e.target.checked)}
                        disabled={!isEditing}
                        className="w-5 h-5"
                        style={{ 
                          accentColor: '#00AA00', 
                          cursor: isEditing ? 'pointer' : 'not-allowed' 
                        }}
                      />
                      <label
                        htmlFor="approved-checkbox"
                        className="text-sm font-bold uppercase"
                        style={{
                          fontFamily: 'var(--y2k-font-ui)',
                          color: Boolean(editedTeam?.approved) ? '#00AA00' : '#D97706',
                          letterSpacing: '0.06em',
                          cursor: isEditing ? 'pointer' : 'default',
                        }}
                      >
                        {Boolean(editedTeam?.approved) ? '✓ APPROVED' : '⏱ PENDING APPROVAL'}
                      </label>
                    </div>
                  </div>

                  {/* Fee Summary */}
                  <div className="pt-4 mt-4 p-3"
                    style={{
                      background: '#F0F9FF',
                      border: '3px solid #0055FF',
                      boxShadow: '3px 3px 0px #001A6E'
                    }}>
                    <label className="block text-xs font-bold uppercase mb-3" 
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                      💰 Payment Fee Summary
                    </label>
                    <div className="space-y-1 mb-3">
                      {/* Leader */}
                      <div className="flex justify-between text-xs px-2 py-1 rounded"
                        style={{
                          background: editedTeam?.leader_ieee_member ? '#E0F2FE' : '#FEF3C7',
                          fontFamily: 'var(--y2k-font-ui)',
                          color: '#001A6E'
                        }}>
                        <span>{editedTeam?.leader_name || 'Leader'} {editedTeam?.leader_ieee_member ? '(IEEE)' : ''}</span>
                        <span className="font-bold">₹{editedTeam?.leader_ieee_member ? '399' : '499'}</span>
                      </div>
                      {/* Member 2 */}
                      {(editedTeam?.total_members >= 2 || editedTeam?.member2_name) && (
                        <div className="flex justify-between text-xs px-2 py-1 rounded"
                          style={{
                            background: editedTeam?.member2_ieee_member ? '#E0F2FE' : '#FEF3C7',
                            fontFamily: 'var(--y2k-font-ui)',
                            color: '#001A6E'
                          }}>
                          <span>{editedTeam?.member2_name || 'Member 2'} {editedTeam?.member2_ieee_member ? '(IEEE)' : ''}</span>
                          <span className="font-bold">₹{editedTeam?.member2_ieee_member ? '399' : '499'}</span>
                        </div>
                      )}
                      {/* Member 3 */}
                      {(editedTeam?.total_members >= 3 || editedTeam?.member3_name) && (
                        <div className="flex justify-between text-xs px-2 py-1 rounded"
                          style={{
                            background: editedTeam?.member3_ieee_member ? '#E0F2FE' : '#FEF3C7',
                            fontFamily: 'var(--y2k-font-ui)',
                            color: '#001A6E'
                          }}>
                          <span>{editedTeam?.member3_name || 'Member 3'} {editedTeam?.member3_ieee_member ? '(IEEE)' : ''}</span>
                          <span className="font-bold">₹{editedTeam?.member3_ieee_member ? '399' : '499'}</span>
                        </div>
                      )}
                      {/* Member 4 */}
                      {(editedTeam?.total_members >= 4 || editedTeam?.member4_name) && (
                        <div className="flex justify-between text-xs px-2 py-1 rounded"
                          style={{
                            background: editedTeam?.member4_ieee_member ? '#E0F2FE' : '#FEF3C7',
                            fontFamily: 'var(--y2k-font-ui)',
                            color: '#001A6E'
                          }}>
                          <span>{editedTeam?.member4_name || 'Member 4'} {editedTeam?.member4_ieee_member ? '(IEEE)' : ''}</span>
                          <span className="font-bold">₹{editedTeam?.member4_ieee_member ? '399' : '499'}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-2" style={{ borderTop: '2px solid #0055FF' }}>
                      <div className="flex justify-between text-sm font-bold"
                        style={{
                          fontFamily: 'var(--y2k-font-display)',
                          color: '#0055FF'
                        }}>
                        <span>Total Amount</span>
                        <span>
                          ₹{
                            ((editedTeam?.leader_ieee_member ? 399 : 499)) +
                            ((editedTeam?.total_members >= 2 || editedTeam?.member2_name) ? (editedTeam?.member2_ieee_member ? 399 : 499) : 0) +
                            ((editedTeam?.total_members >= 3 || editedTeam?.member3_name) ? (editedTeam?.member3_ieee_member ? 399 : 499) : 0) +
                            ((editedTeam?.total_members >= 4 || editedTeam?.member4_name) ? (editedTeam?.member4_ieee_member ? 399 : 499) : 0)
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Screenshots */}
                  {(() => {
                    try {
                      const urls = editedTeam?.payment_screenshot_urls 
                        ? JSON.parse(editedTeam.payment_screenshot_urls) 
                        : [];
                      
                      if (urls.length > 0) {
                        return (
                          <div>
                            <label className="block text-xs font-bold uppercase mb-2" 
                              style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                              Payment Screenshots ({urls.length})
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {urls.map((url, index) => (
                                <div key={index} className="border-3 border-[#001A6E] rounded overflow-hidden">
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block hover:opacity-80 transition-opacity"
                                  >
                                    <img 
                                      src={url} 
                                      alt={`Payment Screenshot ${index + 1}`} 
                                      className="w-full h-auto max-h-64 object-contain bg-gray-100"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                      }}
                                    />
                                    <div style={{ display: 'none', padding: '1rem', textAlign: 'center', background: '#F1F5F9', color: '#64748B', fontSize: '0.75rem' }}>
                                      Unable to load image {index + 1}
                                    </div>
                                  </a>
                                  <div className="px-2 py-1 text-xs text-center" style={{ background: '#F1F5F9', color: '#001A6E', fontFamily: 'var(--y2k-font-ui)' }}>
                                    Screenshot {index + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    } catch (e) {
                      // Handle old single URL format for backward compatibility
                      if (editedTeam?.payment_screenshot_url) {
                        return (
                          <div>
                            <label className="block text-xs font-bold uppercase mb-2" 
                              style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                              Payment Screenshot
                            </label>
                            <div className="border-3 border-[#001A6E] rounded overflow-hidden">
                              <a 
                                href={editedTeam.payment_screenshot_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block hover:opacity-80 transition-opacity"
                              >
                                <img 
                                  src={editedTeam.payment_screenshot_url} 
                                  alt="Payment Screenshot" 
                                  className="w-full h-auto max-h-96 object-contain bg-gray-100"
                                />
                              </a>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}

                  {/* Leader Details */}
                  <div className="pt-4 mt-4" style={{ borderTop: '3px solid #E2E8F0' }}>
                    <h4 className="text-base font-bold uppercase mb-3" 
                      style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                      👤 Leader (Member 1)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2" 
                          style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                          Name
                        </label>
                        <input
                          type="text"
                          value={editedTeam?.leader_name || ''}
                          onChange={(e) => handleFieldChange('leader_name', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 text-sm font-medium"
                          style={{
                            fontFamily: 'var(--y2k-font-ui)',
                            background: isEditing ? '#FFFFFF' : '#F1F5F9',
                            color: '#001A6E',
                            border: '3px solid #001A6E',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2" 
                          style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={editedTeam?.leader_email || ''}
                          onChange={(e) => handleFieldChange('leader_email', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 text-sm font-medium"
                          style={{
                            fontFamily: 'var(--y2k-font-ui)',
                            background: isEditing ? '#FFFFFF' : '#F1F5F9',
                            color: '#001A6E',
                            border: '3px solid #001A6E',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2" 
                          style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editedTeam?.leader_phone || ''}
                          onChange={(e) => handleFieldChange('leader_phone', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 text-sm font-medium"
                          style={{
                            fontFamily: 'var(--y2k-font-ui)',
                            background: isEditing ? '#FFFFFF' : '#F1F5F9',
                            color: '#001A6E',
                            border: '3px solid #001A6E',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2" 
                          style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                          Year of Study
                        </label>
                        <input
                          type="text"
                          value={editedTeam?.leader_year || ''}
                          onChange={(e) => handleFieldChange('leader_year', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 text-sm font-medium"
                          style={{
                            fontFamily: 'var(--y2k-font-ui)',
                            background: isEditing ? '#FFFFFF' : '#F1F5F9',
                            color: '#001A6E',
                            border: '3px solid #001A6E',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2" 
                          style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                          IEEE Member
                        </label>
                        <div className="flex items-center gap-3 p-3"
                          style={{
                            background: '#F8FAFC',
                            border: '3px solid #E2E8F0',
                          }}>
                          <input
                            id="leader-ieee-checkbox"
                            type="checkbox"
                            checked={Boolean(editedTeam?.leader_ieee_member)}
                            onChange={(e) => handleFieldChange('leader_ieee_member', e.target.checked)}
                            disabled={!isEditing}
                            className="w-5 h-5"
                            style={{
                              accentColor: '#0055FF',
                              cursor: isEditing ? 'pointer' : 'not-allowed'
                            }}
                          />
                          <label
                            htmlFor="leader-ieee-checkbox"
                            className="text-sm font-bold uppercase"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              color: Boolean(editedTeam?.leader_ieee_member) ? '#00AA00' : '#64748B',
                              letterSpacing: '0.06em',
                              cursor: isEditing ? 'pointer' : 'default',
                            }}
                          >
                            {Boolean(editedTeam?.leader_ieee_member) ? '✓ YES' : '✗ NO'}
                          </label>
                        </div>
                      </div>
                      {editedTeam?.leader_ieee_member && (
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#0055FF', letterSpacing: '0.1em' }}>
                            IEEE Membership ID
                          </label>
                          <input
                            type="text"
                            value={editedTeam?.leader_ieee_id || ''}
                            onChange={(e) => handleFieldChange('leader_ieee_id', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#0055FF',
                              border: '3px solid #0055FF',
                              outline: 'none',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member 2 */}
                  {(editedTeam?.total_members >= 2 || editedTeam?.member2_name) && (
                    <div className="pt-4" style={{ borderTop: '3px solid #E2E8F0' }}>
                      <h4 className="text-base font-bold uppercase mb-3" 
                        style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                        👤 Member 2
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Name
                          </label>
                          <input
                            type="text"
                            value={editedTeam?.member2_name || ''}
                            onChange={(e) => handleFieldChange('member2_name', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Email
                          </label>
                          <input
                            type="email"
                            value={editedTeam?.member2_email || ''}
                            onChange={(e) => handleFieldChange('member2_email', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={editedTeam?.member2_phone || ''}
                            onChange={(e) => handleFieldChange('member2_phone', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Year of Study
                          </label>
                          <input
                            type="text"
                            value={editedTeam?.member2_year || ''}
                            onChange={(e) => handleFieldChange('member2_year', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            IEEE Member
                          </label>
                          <div className="flex items-center gap-3 p-3"
                            style={{
                              background: '#F8FAFC',
                              border: '3px solid #E2E8F0',
                            }}>
                            <input
                              id="member2-ieee-checkbox"
                              type="checkbox"
                              checked={Boolean(editedTeam?.member2_ieee_member)}
                              onChange={(e) => handleFieldChange('member2_ieee_member', e.target.checked)}
                              disabled={!isEditing}
                              className="w-5 h-5"
                              style={{
                                accentColor: '#0055FF',
                                cursor: isEditing ? 'pointer' : 'not-allowed'
                              }}
                            />
                            <label
                              htmlFor="member2-ieee-checkbox"
                              className="text-sm font-bold uppercase"
                              style={{
                                fontFamily: 'var(--y2k-font-ui)',
                                color: Boolean(editedTeam?.member2_ieee_member) ? '#00AA00' : '#64748B',
                                letterSpacing: '0.06em',
                                cursor: isEditing ? 'pointer' : 'default',
                              }}
                            >
                              {Boolean(editedTeam?.member2_ieee_member) ? '✓ YES' : '✗ NO'}
                            </label>
                          </div>
                        </div>
                        {editedTeam?.member2_ieee_member && (
                          <div>
                            <label className="block text-xs font-bold uppercase mb-2" 
                              style={{ fontFamily: 'var(--y2k-font-ui)', color: '#0055FF', letterSpacing: '0.1em' }}>
                              IEEE Membership ID
                            </label>
                            <input
                              type="text"
                              value={editedTeam?.member2_ieee_id || ''}
                              onChange={(e) => handleFieldChange('member2_ieee_id', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 text-sm font-medium"
                              style={{
                                fontFamily: 'var(--y2k-font-ui)',
                                background: isEditing ? '#FFFFFF' : '#F1F5F9',
                                color: '#0055FF',
                                border: '3px solid #0055FF',
                                outline: 'none',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Member 3 */}
                  {(editedTeam?.total_members >= 3 || editedTeam?.member3_name) && (
                    <div className="pt-4" style={{ borderTop: '3px solid #E2E8F0' }}>
                      <h4 className="text-base font-bold uppercase mb-3" 
                        style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                        👤 Member 3
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Name
                          </label>
                          <input
                            type="text"
                            value={editedTeam?.member3_name || ''}
                            onChange={(e) => handleFieldChange('member3_name', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Email
                          </label>
                          <input
                            type="email"
                            value={editedTeam?.member3_email || ''}
                            onChange={(e) => handleFieldChange('member3_email', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={editedTeam?.member3_phone || ''}
                            onChange={(e) => handleFieldChange('member3_phone', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Year of Study
                          </label>
                          <input
                            type="text"
                            value={editedTeam?.member3_year || ''}
                            onChange={(e) => handleFieldChange('member3_year', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            IEEE Member
                          </label>
                          <div className="flex items-center gap-3 p-3"
                            style={{
                              background: '#F8FAFC',
                              border: '3px solid #E2E8F0',
                            }}>
                            <input
                              id="member3-ieee-checkbox"
                              type="checkbox"
                              checked={Boolean(editedTeam?.member3_ieee_member)}
                              onChange={(e) => handleFieldChange('member3_ieee_member', e.target.checked)}
                              disabled={!isEditing}
                              className="w-5 h-5"
                              style={{
                                accentColor: '#0055FF',
                                cursor: isEditing ? 'pointer' : 'not-allowed'
                              }}
                            />
                            <label
                              htmlFor="member3-ieee-checkbox"
                              className="text-sm font-bold uppercase"
                              style={{
                                fontFamily: 'var(--y2k-font-ui)',
                                color: Boolean(editedTeam?.member3_ieee_member) ? '#00AA00' : '#64748B',
                                letterSpacing: '0.06em',
                                cursor: isEditing ? 'pointer' : 'default',
                              }}
                            >
                              {Boolean(editedTeam?.member3_ieee_member) ? '✓ YES' : '✗ NO'}
                            </label>
                          </div>
                        </div>
                        {editedTeam?.member3_ieee_member && (
                          <div>
                            <label className="block text-xs font-bold uppercase mb-2" 
                              style={{ fontFamily: 'var(--y2k-font-ui)', color: '#0055FF', letterSpacing: '0.1em' }}>
                              IEEE Membership ID
                            </label>
                            <input
                              type="text"
                              value={editedTeam?.member3_ieee_id || ''}
                              onChange={(e) => handleFieldChange('member3_ieee_id', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 text-sm font-medium"
                              style={{
                                fontFamily: 'var(--y2k-font-ui)',
                                background: isEditing ? '#FFFFFF' : '#F1F5F9',
                                color: '#0055FF',
                                border: '3px solid #0055FF',
                                outline: 'none',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Member 4 */}
                  {(editedTeam?.total_members >= 4 || editedTeam?.member4_name) && (
                    <div className="pt-4" style={{ borderTop: '3px solid #E2E8F0' }}>
                      <h4 className="text-base font-bold uppercase mb-3" 
                        style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                        👤 Member 4
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Name
                          </label>
                          <input
                            type="text"
                            value={editedTeam?.member4_name || ''}
                            onChange={(e) => handleFieldChange('member4_name', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Email
                          </label>
                          <input
                            type="email"
                            value={editedTeam?.member4_email || ''}
                            onChange={(e) => handleFieldChange('member4_email', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={editedTeam?.member4_phone || ''}
                            onChange={(e) => handleFieldChange('member4_phone', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            Year of Study
                          </label>
                          <input
                            type="text"
                            value={editedTeam?.member4_year || ''}
                            onChange={(e) => handleFieldChange('member4_year', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 text-sm font-medium"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: isEditing ? '#FFFFFF' : '#F1F5F9',
                              color: '#001A6E',
                              border: '3px solid #001A6E',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2" 
                            style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.1em' }}>
                            IEEE Member
                          </label>
                          <div className="flex items-center gap-3 p-3"
                            style={{
                              background: '#F8FAFC',
                              border: '3px solid #E2E8F0',
                            }}>
                            <input
                              id="member4-ieee-checkbox"
                              type="checkbox"
                              checked={Boolean(editedTeam?.member4_ieee_member)}
                              onChange={(e) => handleFieldChange('member4_ieee_member', e.target.checked)}
                              disabled={!isEditing}
                              className="w-5 h-5"
                              style={{
                                accentColor: '#0055FF',
                                cursor: isEditing ? 'pointer' : 'not-allowed'
                              }}
                            />
                            <label
                              htmlFor="member4-ieee-checkbox"
                              className="text-sm font-bold uppercase"
                              style={{
                                fontFamily: 'var(--y2k-font-ui)',
                                color: Boolean(editedTeam?.member4_ieee_member) ? '#00AA00' : '#64748B',
                                letterSpacing: '0.06em',
                                cursor: isEditing ? 'pointer' : 'default',
                              }}
                            >
                              {Boolean(editedTeam?.member4_ieee_member) ? '✓ YES' : '✗ NO'}
                            </label>
                          </div>
                        </div>
                        {editedTeam?.member4_ieee_member && (
                          <div>
                            <label className="block text-xs font-bold uppercase mb-2" 
                              style={{ fontFamily: 'var(--y2k-font-ui)', color: '#0055FF', letterSpacing: '0.1em' }}>
                              IEEE Membership ID
                            </label>
                            <input
                              type="text"
                              value={editedTeam?.member4_ieee_id || ''}
                              onChange={(e) => handleFieldChange('member4_ieee_id', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 text-sm font-medium"
                              style={{
                                fontFamily: 'var(--y2k-font-ui)',
                                background: isEditing ? '#FFFFFF' : '#F1F5F9',
                                color: '#0055FF',
                                border: '3px solid #0055FF',
                                outline: 'none',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="pt-4" style={{ borderTop: '3px solid #E2E8F0' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2" 
                          style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B', letterSpacing: '0.1em' }}>
                          Team ID
                        </label>
                        <input
                          type="text"
                          value={editedTeam?.team_id || ''}
                          disabled
                          className="w-full px-4 py-2 text-xs font-mono cursor-not-allowed"
                          style={{
                            background: '#F1F5F9',
                            color: '#64748B',
                            border: '3px solid #CBD5E1',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2" 
                          style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B', letterSpacing: '0.1em' }}>
                          Created At
                        </label>
                        <input
                          type="text"
                          value={editedTeam?.created_at ? new Date(editedTeam.created_at).toLocaleString() : 'N/A'}
                          disabled
                          className="w-full px-4 py-2 text-xs font-mono cursor-not-allowed"
                          style={{
                            background: '#F1F5F9',
                            color: '#64748B',
                            border: '3px solid #CBD5E1',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Y2K Buttons */}
              <div className="px-6 py-4 flex justify-between items-center"
                style={{ background: '#F8FAFC', borderTop: '3px solid #E2E8F0' }}>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 font-bold uppercase text-xs"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: '#FFFFFF',
                    color: '#64748B',
                    border: '3px solid #CBD5E1',
                    letterSpacing: '0.08em',
                    boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  Close
                </button>
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleEditToggle}
                        disabled={saveLoading}
                        className="px-4 py-2 font-bold uppercase text-xs"
                        style={{
                          fontFamily: 'var(--y2k-font-ui)',
                          background: '#FFFFFF',
                          color: '#64748B',
                          border: '3px solid #CBD5E1',
                          letterSpacing: '0.08em',
                          boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.1)',
                          cursor: saveLoading ? 'not-allowed' : 'pointer',
                          opacity: saveLoading ? 0.6 : 1,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        disabled={saveLoading}
                        className="px-4 py-2 font-bold uppercase text-xs flex items-center gap-2"
                        style={{
                          fontFamily: 'var(--y2k-font-ui)',
                          background: saveLoading ? '#CBD5E1' : '#CCFF00',
                          color: '#001A6E',
                          border: '3px solid #001A6E',
                          letterSpacing: '0.08em',
                          boxShadow: '4px 4px 0px #001A6E',
                          cursor: saveLoading ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {saveLoading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                              style={{ borderColor: '#001A6E', borderTopColor: 'transparent' }}></div>
                            Saving...
                          </>
                        ) : (
                          '💾 Save Changes'
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditToggle}
                      className="px-4 py-2 font-bold uppercase text-xs"
                      style={{
                        fontFamily: 'var(--y2k-font-ui)',
                        background: '#001A6E',
                        color: '#FFFFFF',
                        border: '3px solid #001A6E',
                        letterSpacing: '0.08em',
                        boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
