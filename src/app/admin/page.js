'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasAdminToken, removeAdminToken } from '@/lib/adminAuth';
import AdminPanelTabs from './AdminPanelTabs';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AdminPanelTabs />;
}

