'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Tag, ExternalLink, Clock } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/api';

// ─── helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    // backdrop
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

      {/* Modal card — stop propagation so clicking inside doesn't close */}
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

        {/* Body — clicking here navigates if link exists */}
        <div
          className={`px-5 pt-4 pb-2 ${link ? 'cursor-pointer group' : ''}`}
          onClick={() => { if (link) { onClose(); window.location.href = link; } }}
        >
          {/* Title row */}
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

          {/* Time */}
          <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-3">
            <Clock size={11} /> {timeAgo(notif.created_at)}
          </p>

          {/* Description */}
          {notif.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {notif.description}
            </p>
          )}

          {/* Tap to open hint */}
          {link && (
            <p className="text-[11px] text-[#FF5533] font-medium mb-1">
              Tap to open link →
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
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

// ─── Main component ──────────────────────────────────────────────────────────
export default function NotificationBell() {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('notif_read_ids') || '[]'); }
    catch { return []; }
  });
  const [loading, setLoading]         = useState(false);
  const [activeNotif, setActiveNotif] = useState(null); 
  const dropdownRef                   = useRef(null);
  

  // ─── fetch ─────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
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
      if (data?.success && Array.isArray(data.data)) setNotifications(data.data);
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    window.addEventListener('authStateChanged', fetchNotifications);
    return () => window.removeEventListener('authStateChanged', fetchNotifications);
  }, [fetchNotifications]);

  // close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ─── read helpers ───────────────────────────────────────────────────────────
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

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const handleBellClick = () => {
    setOpen((prev) => !prev);
    if (!open) fetchNotifications();
  };

  // dropdown item click → mark read + open modal
  const handleItemClick = (notif) => {
    markRead(notif.id);
    setOpen(false);
    setActiveNotif(notif);
  };

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell button */}
        <button
          onClick={handleBellClick}
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          className="relative w-[38px] h-[38px] rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Bell size={18} className="text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] bg-[#E2136E] text-white text-[10px] font-medium rounded-full flex items-center justify-center px-[3px] border-[1.5px] border-white leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="
                fixed md:absolute
                top-16 md:top-full
                left-1/2 md:left-auto
                -translate-x-1/2 md:translate-x-0
                md:right-0
                w-[95vw] max-w-sm
                bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden
            "
            >
            <style>{`
              @keyframes zoomIn {
                from { opacity: 0; transform: scale(0.95) translateY(-4px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>

            {/* Dropdown header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Bell size={14} /> Notifications
              </span>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#FF5533] hover:text-[#e64e27] transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
              {loading ? (
                <div className="flex flex-col gap-2 p-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Bell size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isUnread = !readIds.includes(notif.id);
                  const imgUrl   = getImageUrl(notif.image);
                  const hasLink  = !!(notif.link_for_web || notif.link_for_app);

                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleItemClick(notif)}
                      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-100 text-left transition-colors cursor-pointer ${
                        isUnread ? 'bg-[#FFF5F3] hover:bg-[#ffe9e3]' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <Tag size={18} className="text-[#FF5533]" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-800 truncate leading-tight">
                          {notif.title}
                        </p>
                        {notif.description && (
                          <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-1">
                            {notif.description}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                          <Clock size={10} /> {timeAgo(notif.created_at)}
                          {hasLink && (
                            <span className="ml-1 text-[#FF5533]">· View</span>
                          )}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#FF5533] flex-shrink-0 mt-1.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-[12px] text-[#FF5533] font-medium py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                View all notifications →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal — rendered outside dropdown so z-index is clean */}
      {activeNotif && (
        <NotificationModal
          notif={activeNotif}
          onClose={() => setActiveNotif(null)}
        />
      )}
    </>
  );
}