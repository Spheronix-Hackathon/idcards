'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('spheronix_admin_token');
    const savedUser = localStorage.getItem('spheronix_admin_user');

    if (!savedToken && requireAuth) {
      router.push('/admin/login');
    } else {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {}
      }
    }
    setLoading(false);
  }, [requireAuth, router]);

  const logout = async () => {
    await api.adminLogout();
    setUser(null);
    setToken(null);
    router.push('/admin/login');
  };

  return { user, token, loading, logout, isAuthenticated: !!token };
}
