import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Plane,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Building,
  AlertCircle,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { API_BASE_URL } from '../apiConfig';

const STATUS_STAGES = [
  { key: 'Pre-ordered', label: '1. Pre-ordered', desc: 'Deposit confirmed & claim locked' },
  { key: 'Purchased', label: '2. Purchased', desc: 'Inspected by agent in London/US' },
  { key: 'Shipped', label: '3. Shipped', desc: 'Double-boxed & booked on air cargo' },
  { key: 'In Transit', label: '4. In Transit', desc: 'Cargo flight en route to Kotoka (ACC)' },
  { key: 'Arrived', label: '5. Arrived', desc: 'Customs cleared in Accra depot' },
  { key: 'Delivered', label: '6. Delivered', desc: 'Doorstep dispatch complete' }
];

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [query, setQuery] = useState(searchParams.get('query') || 'EC-94821');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = (searchCode) => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setError('');

    fetch(`${API_BASE_URL}/api/orders/track/${encodeURIComponent(searchCode.trim())}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setOrder(null);
          setError(data.message || `No pre-order found for "${searchCode}". Try sample order EC-94821.`);
        }
      })
      .catch(() => {
        setError('Failed to reach tracking server. Please check your internet connection.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (query) {
      fetchOrder(query);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder(query);
  };

  const currentStageIndex = order
    ? STATUS_STAGES.findIndex(s => s.key.toLowerCase() === order.status?.toLowerCase())
    : 0;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider shadow-sm">
            <Plane className="w-3.5 h-3.5" />
            <span>Air Cargo & Pre-Order Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black dark:text-white">
            Track Pre-Order
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            Enter your EarlyClaim order number (e.g. <strong>EC-94821</strong>) to check air freight flight status and Ghana customs progress.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="Enter Order Code (e.g. EC-94821)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full pl-10 pr-4 py-3 text-xs sm:text-sm text-black dark:text-white font-mono uppercase focus:outline-none focus:border-black dark:focus:border-white shadow-sm"
            />
            <Package className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition shadow-md"
          >
            {loading ? 'Locating...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tracking Details View */}
        {order && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-200">
            {/* Top Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Order Reference</span>
                <h3 className="text-xl font-black text-black dark:text-white font-mono">{order.orderNumber}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Pre-ordered on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Current Status</span>
                  <p className="text-sm font-black text-black dark:text-white">{order.status}</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-ping"></div>
              </div>
            </div>

            {/* Visual Step Progression Bar (LitBuy-Style) */}
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {STATUS_STAGES.map((stage, idx) => {
                  const isDone = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.key} className="flex flex-col items-start space-y-1.5">
                      <div className="w-full flex items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-black text-white dark:bg-white dark:text-black ring-4 ring-zinc-200 dark:ring-zinc-800'
                              : isDone
                              ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div
                          className={`flex-1 h-1 ml-2 rounded-full ${
                            idx < currentStageIndex
                              ? 'bg-black dark:bg-white'
                              : 'bg-zinc-200 dark:bg-zinc-800'
                          }`}
                        ></div>
                      </div>
                      <p className={`text-[11px] font-bold ${isCurrent ? 'text-black dark:text-white' : 'text-zinc-500'}`}>
                        {stage.key}
                      </p>
                      <p className="text-[9px] text-zinc-400 leading-tight">
                        {stage.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flight & Courier Airway Bill Metadata */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-zinc-400 text-[10px] uppercase font-bold">Shipping Method</p>
                <p className="font-semibold text-black dark:text-white capitalize">
                  {order.shippingMethod === 'sea' ? 'Sea Freight (~6–8 weeks)' : 'Air Freight (~2–3 weeks)'}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-[10px] uppercase font-bold">Courier & Carrier</p>
                <p className="font-semibold text-black dark:text-white">
                  {order.shippingMethod === 'sea' ? 'Maersk / Grimaldi Line' : 'DHL Cargo / BA Aviation'}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-[10px] uppercase font-bold">Receiver</p>
                <p className="font-semibold text-black dark:text-white">{order.customerName}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-[10px] uppercase font-bold">Delivery Location</p>
                <p className="font-semibold text-black dark:text-white">{order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
              </div>
            </div>

            {/* Items in Pre-Order */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                Pre-Ordered Items
              </h4>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
                    <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1 truncate">
                      <p className="font-bold text-black dark:text-white truncate">{item.name}</p>
                      <p className="text-zinc-500 text-[11px]">{item.size} • {item.color} • Qty {item.quantity}</p>
                    </div>
                    <span className="font-black text-black dark:text-white">{formatPrice(item.priceGHS * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Logs & Timestamped Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                Logistics Event History
              </h4>
              <div className="relative pl-6 space-y-4 border-l border-zinc-200 dark:border-zinc-800 ml-2">
                {order.timeline && order.timeline.length > 0 ? (
                  order.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-black dark:bg-white border-2 border-white dark:border-black"></div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-xs text-black dark:text-white">{event.title}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{event.date}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{event.note}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">Order is registered and awaiting dispatch manifest.</p>
                )}
              </div>
            </div>

            {/* Need Help WhatsApp Button */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Have questions about this consignment?</span>
              <a
                href={`https://wa.me/233530279271?text=Hello%20EarlyClaim,%20I%20have%20an%20inquiry%20regarding%20tracking%20number%20${order.orderNumber}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-black dark:text-white flex items-center gap-1 hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contact Officer via WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
