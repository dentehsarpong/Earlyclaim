/**
 * NotificationContext — provides buyer and admin notification state.
 * Connects via SSE for real-time push, with a polling fallback.
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../apiConfig';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();

  // Buyer notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Admin notifications
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminUnread, setAdminUnread] = useState(0);

  const sseRef = useRef(null);
  const pollRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  const fetchBuyerNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread || 0);
      }
    } catch {}
  }, [token]);

  const fetchAdminNotifications = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminNotifications(data.notifications || []);
        setAdminUnread(data.unread || 0);
      }
    } catch {}
  }, [token, isAdmin]);

  // Connect SSE
  useEffect(() => {
    if (!token) return;

    // Initial fetch
    fetchBuyerNotifications();
    if (isAdmin) fetchAdminNotifications();

    // SSE connection
    try {
      const sse = new EventSource(`${API_BASE_URL}/api/notifications/stream?token=${token}`);
      sseRef.current = sse;

      sse.addEventListener('notification', () => {
        fetchBuyerNotifications();
      });
      sse.addEventListener('admin_notification', () => {
        if (isAdmin) fetchAdminNotifications();
      });
      sse.onerror = () => {
        // SSE failed — fall back to polling
        sse.close();
        startPolling();
      };
    } catch {
      startPolling();
    }

    return () => {
      sseRef.current?.close();
      clearInterval(pollRef.current);
    };
  }, [token, isAdmin]);

  function startPolling() {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchBuyerNotifications();
      if (isAdmin) fetchAdminNotifications();
    }, 30000); // 30 s fallback poll
  }

  const markBuyerRead = async (id) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/notifications/my/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllBuyerRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/notifications/my/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markAdminRead = async (id) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/notifications/admin/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setAdminUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAdminRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/notifications/admin/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setAdminUnread(0);
    } catch {}
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      adminNotifications,
      adminUnread,
      fetchBuyerNotifications,
      fetchAdminNotifications,
      markBuyerRead,
      markAllBuyerRead,
      markAdminRead,
      markAllAdminRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
