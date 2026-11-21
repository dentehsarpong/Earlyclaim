import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ShoppingCart,
  Package,
  MessageCircle,
  Users,
  ArrowUp,
  Share2
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FloatingSidebar() {
  const { itemCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const [utcTime, setUtcTime] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Live UTC / GMT Clock (Ghana is GMT/UTC+0)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const checkScrollTop = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center bg-black/90 dark:bg-zinc-950/95 backdrop-blur-md text-white border border-zinc-800 rounded-2xl p-1.5 shadow-2xl space-y-2">


      {/* Live UTC Clock */}
      <div
        className="w-10 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-center cursor-default group"
        title="Current Local / Air Cargo Logistics Time (UTC+0 Ghana Time)"
      >
        <Clock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
        <span className="text-[8px] font-mono font-bold text-zinc-300 mt-0.5 leading-none">
          {utcTime.split(' ')[0]}
        </span>
        <span className="text-[7px] text-zinc-500 uppercase tracking-tighter">UTC</span>
      </div>

      <div className="w-6 h-[1px] bg-zinc-800 my-1"></div>





      {/* WhatsApp Support: 0530279271 / +233 53 027 9271 */}
      <a
        href="https://wa.me/233530279271?text=Hello%20EarlyClaim,%20I%20would%20like%20to%20inquire%20about%20a%20pre-order."
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-xl bg-[#25D366] text-white hover:opacity-90 flex items-center justify-center transition shadow-lg group"
        title="Chat on WhatsApp (+233 53 027 9271)"
      >
        <MessageCircle className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
      </a>

      {/* Community Links (Discord/Telegram) */}
      <a
        href="https://telegram.org"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition"
        title="Join EarlyClaim Telegram VIP Drops Channel"
      >
        <Users className="w-4 h-4" />
      </a>

      {/* Back to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-xl bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition shadow-lg"
          title="Back to Top"
        >
          <ArrowUp className="w-4 h-4 font-bold" />
        </button>
      )}
    </aside>
  );
}
