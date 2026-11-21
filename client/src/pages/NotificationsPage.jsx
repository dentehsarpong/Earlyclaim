/**
 * NotificationsPage — full-page view of a buyer's notification history.
 * Accessible via /notifications or from the notification bell dropdown footer.
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Package, CheckCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const STATUS_COLORS = {
  'Pre-ordered': 'text-zinc-500',
  'Purchased': 'text-blue-600 dark:text-blue-400',
  'Shipped': 'text-purple-600 dark:text-purple-400',
  'In Transit': 'text-orange-600 dark:text-orange-400',
  'Arrived': 'text-teal-600 dark:text-teal-400',
  'Delivered': 'text-green-600 dark:text-green-400'
};

export default function NotificationsPage() {
  const { user, openAuthModal } = useAuth();
  const { notifications, unreadCount, markBuyerRead, markAllBuyerRead, fetchBuyerNotifications } = useNotifications();

  useEffect(() => {
    if (user) fetchBuyerNotifications();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <Bell className="w-10 h-10 text-zinc-400 mx-auto" />
        <h2 className="text-xl font-black text-black dark:text-white">Sign in to see your notifications</h2>
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Account</span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
              Notifications
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllBuyerRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <Bell className="w-10 h-10 text-zinc-400 mx-auto" />
            <h3 className="font-bold text-sm text-black dark:text-white">No notifications yet</h3>
            <p className="text-xs text-zinc-500">
              When your order status changes, you'll see it here.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`flex gap-4 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition ${!n.read ? 'bg-zinc-50 dark:bg-zinc-800/30' : ''}`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!n.read ? 'bg-black dark:bg-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                    <Package className={`w-4 h-4 ${!n.read ? 'text-white dark:text-black' : 'text-zinc-500'}`} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-bold ${!n.read ? 'text-black dark:text-white' : 'text-zinc-500'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-zinc-400 flex-shrink-0 font-mono">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{n.message}</p>

                  {n.status && (
                    <span className={`mt-1 inline-block text-[10px] font-bold uppercase ${STATUS_COLORS[n.status] || 'text-zinc-500'}`}>
                      {n.status}
                    </span>
                  )}

                  <div className="mt-2 flex items-center gap-4">
                    {n.orderNumber && (
                      <Link
                        to={`/tracking?query=${n.orderNumber}`}
                        onClick={() => markBuyerRead(n.id)}
                        className="text-[11px] font-semibold text-black dark:text-white flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Track order {n.orderNumber}</span>
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => markBuyerRead(n.id)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
