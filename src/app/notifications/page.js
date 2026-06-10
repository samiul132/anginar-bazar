'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Tag, ExternalLink, Clock, ChevronRight, RefreshCw, X } from 'lucide-react';
import { storage } from '@/lib/api';

// ─── helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function getImageUrl(image) {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `https://app.anginarbazar.com/uploads/images/full/${image}`;
}

// ─── Detail Modal ────────────────────────────────────────────────────────────
function NotificationModal({ notif, onClose }) {
  const imgUrl = getImageUrl(notif.image);
  const link   = notif.link_for_web || notif.link_for_app;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        style={{ animation: 'modalIn 0.2s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {imgUrl && (
          <div className="w-full aspect-video bg-gray-100 overflow-hidden">
            <img
              src={imgUrl}
              alt={notif.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Body */}
        <div
          className={`px-5 pt-4 pb-2 ${link ? 'cursor-pointer group' : ''}`}
          onClick={() => { if (link) { onClose(); window.location.href = link; } }}
        >
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-base font-semibold text-gray-900 leading-snug flex-1">
              {notif.title}
            </h2>
            {link && (
              <ExternalLink
                size={16}
                className="text-[#FF5533] flex-shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity"
              />
            )}
          </div>

          <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-3">
            <Clock size={11} /> {timeAgo(notif.created_at)}
          </p>

          {notif.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {notif.description}
            </p>
          )}

          {link && (
            <p className="text-[11px] text-[#FF5533] font-medium mb-1">
              Tap to open link →
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 pt-2 border-t border-gray-100 flex items-center gap-3">
          {link ? (
            <a
              href={link}
              onClick={onClose}
              className="flex-1 text-center py-2 bg-[#FF5533] hover:bg-[#e64e27] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Open Link
            </a>
          ) : (
            <div className="flex-1" />
          )}
          <button
            onClick={onClose}
            className="flex-1 text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [activeNotif, setActiveNotif]     = useState(null);
  const [filter, setFilter]               = useState('all'); // 'all' | 'unread'
  const [readIds, setReadIds]             = useState(() => {
    try { return JSON.parse(localStorage.getItem('notif_read_ids') || '[]'); }
    catch { return []; }
  });

  // ─── fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const token = storage.getAuthToken();
      const BASE  = process.env.NEXT_PUBLIC_API_URL || 'https://app.anginarbazar.com/api';

      let data;
      if (token) {
        const res = await fetch(`${BASE}/my-notifications`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        data = await res.json();
      } else {
        const res = await fetch(`${BASE}/notifications/guest`, {
          headers: { Accept: 'application/json' },
        });
        data = await res.json();
      }

      if (data?.success && Array.isArray(data.data)) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ─── read helpers ────────────────────────────────────────────────────────────
  const markRead = (id) => {
    const next = [...new Set([...readIds, id])];
    setReadIds(next);
    localStorage.setItem('notif_read_ids', JSON.stringify(next));
  };

  const markAllRead = () => {
    const next = notifications.map((n) => n.id);
    setReadIds(next);
    localStorage.setItem('notif_read_ids', JSON.stringify(next));
  };

  const handleItemClick = (notif) => {
    markRead(notif.id);
    setActiveNotif(notif);
  };

  // ─── derived ─────────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const displayed = filter === 'unread'
    ? notifications.filter((n) => !readIds.includes(n.id))
    : notifications;

  // ─── skeleton ────────────────────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-4 px-4 py-4 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-2.5 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );

  // ─── render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto">

          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-[#FF5533]" />
                <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="min-w-[22px] h-[22px] bg-[#E2136E] text-white text-[11px] font-medium rounded-full flex items-center justify-center px-1.5">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#FF5533] hover:text-[#e64e27] font-medium transition-colors cursor-pointer px-2 py-1"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => fetchNotifications(true)}
                  disabled={refreshing}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Refresh"
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="px-4 pb-0 flex gap-1 border-t border-gray-100">
              {[
                { key: 'all',    label: 'All',    count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    filter === tab.key
                      ? 'border-[#FF5533] text-[#FF5533]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                      filter === tab.key
                        ? 'bg-[#FFF5F3] text-[#FF5533]'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white mt-2 rounded-xl overflow-hidden border border-gray-100 mx-2 mb-6">
            {loading ? (
              <Skeleton />
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell size={28} className="opacity-40" />
                </div>
                <p className="text-base font-medium text-gray-500 mb-1">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-sm text-gray-400 text-center">
                  {filter === 'unread'
                    ? "You're all caught up!"
                    : "We'll notify you when something arrives."}
                </p>
                {filter === 'unread' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-4 text-sm text-[#FF5533] font-medium hover:underline cursor-pointer"
                  >
                    View all notifications
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayed.map((notif) => {
                  const isUnread = !readIds.includes(notif.id);
                  const imgUrl   = getImageUrl(notif.image);
                  const hasLink  = !!(notif.link_for_web || notif.link_for_app);

                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleItemClick(notif)}
                      className={`w-full flex items-start gap-4 px-4 py-4 text-left transition-colors cursor-pointer group ${
                        isUnread ? 'bg-[#FFF9F8] hover:bg-[#fff2ef]' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Unread indicator bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-[#FF5533] transition-opacity ${
                        isUnread ? 'opacity-100' : 'opacity-0'
                      }`} style={{ position: 'relative', width: 3, alignSelf: 'stretch', flexShrink: 0, borderRadius: 4 }} />

                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <Tag size={20} className="text-[#FF5533] opacity-60" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${
                            isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                          }`}>
                            {notif.title}
                          </p>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#FF5533] flex-shrink-0 mt-1.5" />
                          )}
                        </div>

                        {notif.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1.5">
                          <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {timeAgo(notif.created_at)}
                          </p>
                          {hasLink && (
                            <span className="text-[11px] text-[#FF5533] font-medium flex items-center gap-0.5">
                              <ExternalLink size={10} /> View
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        size={16}
                        className="text-gray-300 flex-shrink-0 mt-1 group-hover:text-gray-400 transition-colors"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Detail Modal */}
      {activeNotif && (
        <NotificationModal
          notif={activeNotif}
          onClose={() => setActiveNotif(null)}
        />
      )}
    </>
  );
}