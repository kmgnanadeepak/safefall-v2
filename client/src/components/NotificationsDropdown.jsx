import { useState, useEffect } from 'react';
import api from '../services/api';
import { getDemoNotifications } from '../utils/demoData.js';

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications')
      .then(({ data }) => {
        setNotifications(Array.isArray(data) && data.length > 0 ? data : getDemoNotifications());
      })
      .catch(() => setNotifications(getDemoNotifications()));
  }, [open]);

  const markAllRead = () => {
    api.put('/notifications/read-all').then(() => {
      setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    });
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 relative"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-xs flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 glass-card p-2 z-50 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center px-2 py-1">
              <span className="font-semibold">Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-sm text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm p-4">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 rounded-lg my-1 ${!n.read ? 'bg-primary/10' : 'bg-white/5'}`}
                >
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
