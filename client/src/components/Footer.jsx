import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Mail,
  Phone,
  ShieldCheck,
  Plane,
  CreditCard,
  ExternalLink,
  Instagram,
  Twitter,
  Send
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white border-t border-zinc-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 3-Pillar Value Proposition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-zinc-800">
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-black font-black flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">100% Authentic Guaranteed</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Every pair of sneakers, luxury watch, and designer piece is inspected and verified by our procurement team before air dispatch.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-black font-black flex items-center justify-center flex-shrink-0">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">10–21 Days Ghana Delivery</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Direct cargo flights from London, Tokyo, and US hubs directly to Kotoka International Airport (KIA), Accra with door delivery.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-black font-black flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">50% Deposit & Mobile Money</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Secure your claim with a 50% deposit via Paystack, MTN Mobile Money, Telecel Cash, or direct bank transfer.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-zinc-800 text-xs">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm">
                EC
              </div>
              <span className="font-black text-xl tracking-tight">
                EARLY<span className="text-zinc-400 font-light">CLAIM</span>
              </span>
            </div>
            <p className="text-zinc-400 text-xs max-w-sm leading-relaxed">
              Ghana's premier shopping agent & pre-order platform for authentic luxury sneakers, timepieces, haute couture, denim, and niche fragrances.
            </p>

            {/* Business Contact Details */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="w-4 h-4 text-zinc-500" />
                <a href="mailto:dentehsarpong87@gmail.com" className="hover:text-white transition">
                  dentehsarpong87@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="w-4 h-4 text-zinc-500" />
                <a href="tel:0530279271" className="hover:text-white transition">
                  +233 53 027 9271 (0530279271)
                </a>
              </div>
            </div>

            {/* Click-to-Chat WhatsApp Button */}
            <div className="pt-2">
              <a
                href="https://wa.me/233530279271?text=Hello%20EarlyClaim,%20I%20have%20an%20order%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] text-white font-bold text-xs hover:opacity-90 transition shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp: +233 53 027 9271</span>
              </a>
            </div>
          </div>

          {/* How to Pre-order */}
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-white text-xs">How to Pre-Order</h5>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/shipping-info" className="hover:text-white transition">1. Choose or Paste Link</Link></li>
              <li><Link to="/shipping-info" className="hover:text-white transition">2. Pay 50% Deposit</Link></li>
              <li><Link to="/shipping-info" className="hover:text-white transition">3. Air Cargo & Customs</Link></li>
              <li><Link to="/shipping-info" className="hover:text-white transition">4. Doorstep Delivery</Link></li>
              <li><Link to="/paste-and-buy" className="hover:text-white transition">Paste & Buy Agent</Link></li>
              <li><Link to="/calculator" className="hover:text-white transition">Ghana Shipping Calculator</Link></li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-white text-xs">Service & Protection</h5>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/tracking" className="hover:text-white transition">Track Your Pre-Order</Link></li>
              <li><Link to="/shipping-info" className="hover:text-white transition">Shipping & Delivery Rates</Link></li>
              <li><Link to="/shipping-info" className="hover:text-white transition">Customs Clearance Policy</Link></li>
              <li><Link to="/shipping-info" className="hover:text-white transition">Refund & Cancellation</Link></li>
              <li><Link to="/shipping-info" className="hover:text-white transition">Authenticity Guarantee</Link></li>
              <li><Link to="/dashboard?tab=referral" className="hover:text-white transition">Affiliate / Refer & Earn</Link></li>
            </ul>
          </div>

          {/* Pre-Order Categories */}
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-white text-xs">Top Categories</h5>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/?category=Sneakers" className="hover:text-white transition">Sneakers & Dunks</Link></li>
              <li><Link to="/?category=Watches" className="hover:text-white transition">Luxury Timepieces</Link></li>
              <li><Link to="/?category=Designer Brands" className="hover:text-white transition">Designer Outerwear</Link></li>
              <li><Link to="/?category=Jeans" className="hover:text-white transition">Chrome Hearts & Amiri</Link></li>
              <li><Link to="/?category=Perfumes" className="hover:text-white transition">Niche Perfumes</Link></li>
              <li><Link to="/?category=Jewelry" className="hover:text-white transition">Van Cleef & Moissanite</Link></li>
            </ul>
          </div>
        </div>

        {/* Payment Badges & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mr-2">
              Accepted Payments:
            </span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-white font-mono text-[10px] font-bold">
              MTN Mobile Money
            </span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-white font-mono text-[10px] font-bold">
              Telecel Cash
            </span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-white font-mono text-[10px] font-bold">
              AirtelTigo Money
            </span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-white font-mono text-[10px] font-bold">
              Visa / Mastercard
            </span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-white font-mono text-[10px] font-bold">
              Paystack
            </span>
          </div>

          <div className="text-center md:text-right">
            <p className="font-semibold text-white">© 2026 TECH ON DEMAND. All rights reserved.</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">EARLYCLAIM Pre-Order & Shopping Agent System</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
