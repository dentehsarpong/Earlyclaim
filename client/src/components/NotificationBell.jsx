/**
 * NotificationBell — displays unread count badge and a dropdown panel.
 * Used in both Header (for buyers) and AdminDashboardPage (for admins).
 *
 * Props:
 *   mode: 'buyer' | 'admin'  (default: 'buyer')
 */
import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell({ mode = 'buyer' }) {
  const {
    notifications, unreadCount, markBuyerRead, markAllBuyerRead,
    adminNotifications, adminUnread, markAdminRead, markAllAdminRead
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const isAdmin = mode === 'admin';
  const list = isAdmin ? adminNotifications : notifications;
  const unread = isAdmin ? adminUnread : unreadCount;
  const markOne = isAdmin ? markAdminRead : markBuyerRead;
  const markAll = isAdmin ? markAllAdminRead : markAllBuyerRead;

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center leading-none"
            aria-hidden="true"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {isAdmin ? 'Admin Alerts' : 'Notifications'}
              {unread > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white text-black text-[9px] font-black">
                  {unread} new
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
                  aria-label="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition"
                aria-label="Close notifications"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800/60">
            {list.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Bell className="w-7 h-7 text-zinc-700 mx-auto" />
                <p className="text-xs text-zinc-500">No notifications yet</p>
              </div>
            ) : (
              list.map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-zinc-900 transition ${!n.read ? 'bg-zinc-900/50' : ''}`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <Package className={`w-4 h-4 ${!n.read ? 'text-white' : 'text-zinc-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${!n.read ? 'text-white' : 'text-zinc-400'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">{timeAgo(n.createdAt)}</p>

                    {/* Links */}
                    {n.orderNumber && (
                      <div className="mt-1.5 flex items-center gap-3">
                        {!isAdmin ? (
                          <Link
                            to={`/tracking?query=${n.orderNumber}`}
                            onClick={() => { markOne(n.id); setOpen(false); }}
                            className="text-[10px] text-zinc-300 hover:text-white underline"
                          >
                            Track order
                          </Link>
                        ) : (
                          <Link
                            to="/admin"
                            onClick={() => { markOne(n.id); setOpen(false); }}
                            className="text-[10px] text-zinc-300 hover:text-white underline"
                          >
                            View in admin
                          </Link>
                        )}
                        {!n.read && (
                          <button
                            onClick={() => markOne(n.id)}
                            className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 transition"
                          >
                            <Check className="w-3 h-3" />
                            <span>Dismiss</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {!isAdmin && list.length > 0 && (
            <div className="px-4 py-2.5 border-t border-zinc-800 text-center">
              <Link
                to="/dashboard?tab=notifications"
                onClick={() => setOpen(false)}
                className="text-[11px] text-zinc-400 hover:text-white transition"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
