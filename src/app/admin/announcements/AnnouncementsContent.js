'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { removeAdminToken, hasAdminToken } from '@/lib/adminAuth';

export default function AdminAnnouncements({ inTabView = false }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(inTabView);
  const [loading, setLoading] = useState(!inTabView);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    if (inTabView) {
      // Skip auth check when in tab view - parent handles it
      fetchAnnouncements();
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
          await fetchAnnouncements();
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

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements');
      
      if (response.status === 401) {
        if (!inTabView) {
          removeAdminToken();
          router.push('/admin/login');
        } else {
          setError('Authentication error. Please refresh the page.');
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        setAnnouncements(data.announcements || []);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch announcements');
      }
    } catch (err) {
      console.error('Fetch announcements error:', err);
      setError('An error occurred while fetching announcements');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const url = '/api/admin/announcements';
      const method = editingId ? 'PUT' : 'POST';
      // Use content as title for database compatibility
      const submitData = {
        ...formData,
        title: formData.content.substring(0, 100) || 'Announcement'
      };
      const body = editingId 
        ? { id: editingId, ...submitData }
        : submitData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        await fetchAnnouncements();
        resetForm();
      } else {
        setError(data.error || 'Failed to save announcement');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An error occurred while saving');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.content.substring(0, 50),
      content: announcement.content,
      type: announcement.type,
      is_active: announcement.is_active
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await fetchAnnouncements();
      } else {
        setError(data.error || 'Failed to delete announcement');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('An error occurred while deleting');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={inTabView ? "p-6 max-w-7xl mx-auto" : "p-6 max-w-7xl mx-auto"}>
      {/* Header */}
      {!inTabView && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Announcements Management</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Add/Edit Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Create New Announcement
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-white border border-gray-300 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Announcement Text
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="warning">Warning (Yellow)</option>
                  <option value="success">Success (Green)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">All Announcements</h2>
        
        {announcements.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No announcements yet. Create one to get started!</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      announcement.type === 'info' ? 'bg-blue-100 text-blue-800' :
                      announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {announcement.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      announcement.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {announcement.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium mb-2">{announcement.content}</p>
                  <p className="text-xs text-gray-400">
                    Created: {new Date(announcement.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
