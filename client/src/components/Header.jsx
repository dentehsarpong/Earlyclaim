import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import ShipFromBar from './ShipFromBar';

export default function Header({ onOpenSearch }) {
  const { user, logout, openAuthModal } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { currency, setCurrency } = useCurrency();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [toolsOpen, setToolsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toolsRef = useRef(null);
  const moreRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-black text-white border-b border-zinc-800 transition-colors">
      {/* Ship-From Countries Bar */}
      <ShipFromBar />

      {/* Top Announcement Bar */}
      <div className="bg-zinc-900 border-b border-zinc-800/80 text-[11px] py-1.5 px-4 text-zinc-400 flex items-center justify-between tracking-wide">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          <span>Fast Air Cargo to Ghana (Accra & Kumasi) • 50% Pre-Order Deposit Available</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-zinc-400">
          <Link to="/shipping-info" className="hover:text-white transition">Delivery Timelines</Link>
          <span className="text-zinc-600">|</span>
          <a
            href="https://wa.me/233530279271"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 hover:text-white font-medium flex items-center gap-1"
          >
            WhatsApp: +233 53 027 9271
          </a>
        </div>
      </div>

      {/* Main Header Bar (Clean Black & White Luxury Theme) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center tracking-tighter text-sm group-hover:scale-105 transition-transform">
              EC
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-white">
                EARLY<span className="text-zinc-400 font-light">CLAIM</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-medium">
                Shopping Agent • Ghana
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-full transition-all ${
                isActive('/') ? 'bg-white text-black font-semibold' : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Home
            </Link>

            <Link
              to="/paste-and-buy"
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                isActive('/paste-and-buy')
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Paste & Buy</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                Agent
              </span>
            </Link>

            <Link
              to="/tracking"
              className={`px-3 py-1.5 rounded-full transition-all ${
                isActive('/tracking') ? 'bg-white text-black font-semibold' : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Order Tracking
            </Link>

            <Link
              to="/shipping-info"
              className={`px-3 py-1.5 rounded-full transition-all ${
                isActive('/shipping-info') ? 'bg-white text-black font-semibold' : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Shipping Info
            </Link>

            <Link
              to="/calculator"
              className={`px-3 py-1.5 rounded-full transition-all ${
                isActive('/calculator') ? 'bg-white text-black font-semibold' : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Cost Calculator
            </Link>



            {/* More Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-900 transition flex items-center gap-1"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
  <div className="absolute left-0 mt-2 w-48 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl py-2 z-50 text-xs">
    <Link
      to="/shipping-info"
      onClick={() => setMoreOpen(false)}
      className="block px-4 py-2 hover:bg-zinc-900 text-zinc-200"
    >
      Customs & Clearance Info
    </Link>
    <a
      href="https://wa.me/233530279271"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setMoreOpen(false)}
      className="block px-4 py-2 hover:bg-zinc-900 text-zinc-200"
    >
      Customer Support (WhatsApp)
    </a>
    <Link
      to="/calculator"
      onClick={() => setMoreOpen(false)}
      className="block px-4 py-2 hover:bg-zinc-900 text-zinc-200"
    >
      Cost Calculator
    </Link>
    <Link
      to="/paste-and-buy"
      onClick={() => setMoreOpen(false)}
      className="block px-4 py-2 hover:bg-zinc-900 text-zinc-200"
    >
      Paste & Buy
    </Link>
    <Link
      to="/tracking"
      onClick={() => setMoreOpen(false)}
      className="block px-4 py-2 hover:bg-zinc-900 text-zinc-200"
    >
      Order Tracking
    </Link>
    {user && user.role === 'admin' && (
      <Link
        to="/admin"
        onClick={() => setMoreOpen(false)}
        className="block px-4 py-2 hover:bg-zinc-900 text-white font-semibold bg-zinc-900/50 border-t border-zinc-800"
      >
        Admin Dashboard
      </Link>
    )}
  </div>
)}
            </div>
          </nav>
        </div>

        {/* Center/Search in Desktop */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search sneakers, watches, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2 pointer-events-none" />
          </form>
        </div>

        {/* Right: Currency, Dark/Light, Cart, Auth */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Currency Switcher - Reduced Width & Label */}
          <div className="flex items-center bg-zinc-900 rounded-full p-0.5 border border-zinc-800 text-[9px] font-semibold">
            <button
              onClick={() => setCurrency('GHS')}
              className={`px-1.5 py-1 rounded-full transition ${
                currency === 'GHS' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ₵
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-1.5 py-1 rounded-full transition ${
                currency === 'USD' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              $
            </button>
          </div>

          {/* Dark / Light Toggle - Minimal Padding */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Notifications Bell (shown when logged in) */}
          {user && <NotificationBell mode={user.role === 'admin' ? 'admin' : 'buyer'} />}

          {/* Cart Icon - Minimal Padding */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition"
            aria-label={`Shopping cart, ${itemCount} items`}
            title="Pre-Order Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center" aria-hidden="true">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Auth Section - Minimal Padding/Labels */}
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-white transition"
              >
                <div className="w-4 h-4 rounded-full bg-white text-black font-bold flex items-center justify-center text-[8px]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-zinc-800">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-white text-black">
                        ADMIN
                      </span>
                    )}
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-zinc-900 text-zinc-200"
                  >
                    My Pre-Orders & Wishlist
                  </Link>
                  <Link
                    to="/dashboard?tab=referral"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-zinc-900 text-zinc-200"
                  >
                    Referral Earnings ({user.referralEarningsGHS || 0} GHS)
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-zinc-900 text-white font-semibold bg-zinc-900"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-zinc-900 text-red-400 border-t border-zinc-800 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => openAuthModal('login')}
                className="px-2.5 py-1.5 rounded-full bg-white text-black font-semibold text-[10px] transition active:scale-95 shadow-sm"
              >
                Log In
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-zinc-900 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-t border-zinc-800 px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search sneakers, watches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-zinc-900 text-white text-center"
            >
              Home
            </Link>
            <Link
              to="/paste-and-buy"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-zinc-900 text-white text-center flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Paste & Buy</span>
            </Link>
            <Link
              to="/tracking"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-zinc-900 text-white text-center"
            >
              Track Order
            </Link>
            <Link
              to="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-zinc-900 text-white text-center"
            >
              Cost Calculator
            </Link>
            <Link
              to="/shipping-info"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-zinc-900 text-white text-center"
            >
              Shipping Info
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-white text-black text-center font-bold"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="p-2.5 rounded-lg bg-white text-black text-center font-bold"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
