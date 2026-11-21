import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  MessageCircle,
  Copy,
  Clock,
  ShieldCheck,
  Plane
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState(location.state?.order || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order && orderNumber) {
      fetch(`/api/orders/track/${orderNumber}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.order) {
            setOrder(data.order);
          }
        })
        .catch(() => {});
    }
  }, [orderNumber, order]);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5] py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-black dark:bg-white text-white dark:text-black mx-auto flex items-center justify-center shadow-xl animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Allocation Reserved & Pre-Order Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black dark:text-white">
            Thank You For Your Pre-Order!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
            Your international designer allocation has been locked. Our procurement team in London & US has been assigned to inspect and pack your items.
          </p>
        </div>

        {/* Order Number Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Order Number</p>
              <p className="text-xl font-black text-black dark:text-white font-mono">{orderNumber}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-zinc-500">Deposit Status:</p>
              <p className="font-bold text-black dark:text-white capitalize">
                {order?.paymentStatus === 'pending_confirmation' ? 'Pending Staff Verification' : 'Paid & Confirmed'}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Estimated Delivery:</p>
              <p className="font-bold text-black dark:text-white">10–18 Business Days</p>
            </div>
            <div>
              <p className="text-zinc-500">Destination:</p>
              <p className="font-bold text-black dark:text-white">{order?.shippingAddress?.city || 'Accra'}, Ghana</p>
            </div>
            <div>
              <p className="text-zinc-500">Shipping Method:</p>
              <p className="font-bold text-black dark:text-white capitalize">
                {order?.shippingMethod === 'sea' ? 'Sea Freight (~6–8 weeks)' : 'Air Freight (~2–3 weeks)'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* WhatsApp Direct Confirmation */}
          <a
            href={`https://wa.me/233530279271?text=Hello%20EarlyClaim,%20I%20just%20placed%20pre-order%20%23${orderNumber}.%20Please%20verify%20and%20provide%20updates.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Notify Support on WhatsApp (+233 53 027 9271)</span>
          </a>

          {/* Track Order */}
          <Link
            to={`/tracking?query=${orderNumber}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md"
          >
            <Package className="w-4 h-4" />
            <span>Track Flight / Cargo Live</span>
          </Link>
        </div>

        <div>
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white underline"
          >
            ← Return to EARLYCLAIM Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
