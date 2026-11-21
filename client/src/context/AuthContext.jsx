import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('earlyclaim_token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('earlyclaim_token', data.token);
      setIsAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const register = async (name, email, password, phone, referralCode) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, referralCode })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('earlyclaim_token', data.token);
      setIsAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const googleLogin = async (email, name) => {
    const res = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, googleId: 'goog_' + Date.now() })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('earlyclaim_token', data.token);
      setIsAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('earlyclaim_token');
  };

  const toggleWishlist = async (productId) => {
    if (!token) {
      openAuthModal('login');
      return false;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        setUser(prev => ({ ...prev, wishlist: data.wishlist }));
        return data.isWishlisted;
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
    return false;
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        googleLogin,
        logout,
        toggleWishlist,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
