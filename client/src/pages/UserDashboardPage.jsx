import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  Share2,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function UserDashboardPage() {
  const [searchParams] = useSearchParams();
  const { user, token, logout, openAuthModal } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      openAuthModal('login');
      return;
    }

    setLoading(true);
    // Fetch user orders & requests
    Promise.all([
      fetch('/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/requests/my-requests', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/products').then(r => r.json())
    ])
      .then(([ordersData, requestsData, productsData]) => {
        if (ordersData.success) setOrders(ordersData.orders || []);
        if (requestsData.success) setRequests(requestsData.requests || []);
        if (productsData.success && user?.wishlist) {
          const wishlisted = productsData.products.filter(p => user.wishlist.includes(p.id));
          setWishlistProducts(wishlisted);
        }
      })
      .catch(err => console.error('Dashboard data error:', err))
      .finally(() => setLoading(false));
  }, [token, user]);

  const referralLink = `${window.location.origin}/?ref=${user?.referralCode || 'EC2026'}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <h2 className="text-xl font-black">Please Sign In to View Your Dashboard</h2>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Profile Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-2xl flex items-center justify-center shadow-md">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white">{user.name}</h1>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[9px] font-black uppercase">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{user.email} • {user.phone || 'No phone set'}</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Referral Code: <strong className="text-black dark:text-white font-mono">{user.referralCode}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'orders'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            My Pre-Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'requests'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Paste & Buy Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'wishlist'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Wishlist ({wishlistProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('referral')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'referral'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Refer & Earn ({formatPrice(user.referralEarningsGHS || 0)})
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
                <Package className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-black dark:text-white">No active pre-orders</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  When you pre-order sneakers, watches or fashion pieces, you can track their international air freight status right here.
                </p>
                <Link
                  to="/"
                  className="inline-block px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase"
                >
                  Explore Drops
                </Link>
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-zinc-400">Order Code</span>
                      <h4 className="font-black text-base text-black dark:text-white font-mono">{o.orderNumber}</h4>
                      <p className="text-[11px] text-zinc-500">
                        Placed on {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white font-bold text-xs">
                        {o.status}
                      </span>
                      <Link
                        to={`/tracking?query=${o.orderNumber}`}
                        className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase hover:opacity-90 flex items-center gap-1"
                      >
                        <span>Live Tracking</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Items */}
                    <div className="space-y-2">
                      {o.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <img src={it.image} alt="" className="w-12 h-12 object-cover rounded-xl" />
                          <div>
                            <p className="font-semibold text-black dark:text-white">{it.name}</p>
                            <p className="text-zinc-500 text-[11px]">{it.size} • {it.color} • Qty {it.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Breakdown */}
                    <div className="text-xs space-y-1 sm:text-right">
                      <p className="text-zinc-500">Total: <strong className="text-black dark:text-white">{formatPrice(o.totalGHS, o.totalUSD)}</strong></p>
                      <p className="text-zinc-500">Deposit Paid: <strong className="text-green-600 dark:text-green-400">{formatPrice(o.depositPaidGHS)}</strong></p>
                      {o.remainingBalanceGHS > 0 && (
                        <p className="text-zinc-500">Remaining Balance on Arrival: <strong className="text-black dark:text-white">{formatPrice(o.remainingBalanceGHS)}</strong></p>
                      )}
                      <p className="text-zinc-400 text-[11px] pt-1">
                        Destination: {o.shippingAddress?.street}, {o.shippingAddress?.city}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Custom Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
                <Sparkles className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-black dark:text-white">No custom link requests</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Paste any URL from Taobao, Weidian, StockX or Nike to let our international agent buy and ship it for you.
                </p>
                <Link
                  to="/paste-and-buy"
                  className="inline-block px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase"
                >
                  Submit a Link
                </Link>
              </div>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">#{r.requestNumber}</span>
                      <h4 className="font-bold text-sm text-black dark:text-white">{r.productName}</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-black dark:text-white">
                      {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <p className="text-zinc-500 truncate">
                      URL: <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-500 underline truncate">{r.url}</a>
                    </p>
                    <p className="sm:text-right text-zinc-500">
                      Estimated Quote: <strong className="text-black dark:text-white">{formatPrice(r.quotedPriceGHS)}</strong> (Deposit: {formatPrice(r.depositRequiredGHS)})
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
                <Heart className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-sm text-black dark:text-white">Your wishlist is empty</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Click the heart icon on any sneakers or watches to save them to your personal wishlist.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {wishlistProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <img src={p.images?.[0]} alt="" className="w-full aspect-square object-cover rounded-xl" />
                    <h5 className="font-bold text-xs truncate">{p.name}</h5>
                    <p className="font-black text-xs">{formatPrice(p.priceGHS, p.priceUSD)}</p>
                    <Link
                      to={`/product/${p.id}`}
                      className="block text-center py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase"
                    >
                      Pre-order
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Referral System */}
        {activeTab === 'referral' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-black dark:text-white">EARLYCLAIM Affiliate & Referral Program</h3>
              <p className="text-xs text-zinc-500">
                Share your personal link with friends or clients in Ghana. Earn ₵50 cash bonus on every friend who creates an account and pre-orders!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-400">Total Commissions Earned</span>
                <p className="text-2xl font-black text-black dark:text-white">{formatPrice(user.referralEarningsGHS || 0)}</p>
                <p className="text-[11px] text-zinc-500">Paid out via MTN Mobile Money</p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-400">Your Referral Code</span>
                <p className="text-2xl font-black text-black dark:text-white font-mono">{user.referralCode}</p>
                <p className="text-[11px] text-zinc-500">Used during registration</p>
              </div>
            </div>

            {/* Copy Referral Link Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                Shareable Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white font-mono"
                />
                <button
                  onClick={handleCopyReferral}
                  className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/233530279271?text=Hello%20EarlyClaim,%20I%20would%20like%20to%20request%20payout%20for%20my%20referral%20earnings%20(${user.referralCode}).`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90"
              >
                Request MoMo Commission Payout
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
