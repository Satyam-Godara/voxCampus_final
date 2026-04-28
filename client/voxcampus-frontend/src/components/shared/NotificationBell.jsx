import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';

const TYPE_ICON = {
  new_message:    '💬',
  new_post:       '📢',
  post_comment:   '◈',
  post_vote:      '▲',
  announcement:   '📌',
  dm_request:     '◉',
  dm_accepted:    '✓',
  dm_message:     '💬',
  teacher_approved:'✓',
};

export default function NotificationBell({ onNavigate }) {
  const { socket }             = useSocket();
  const [notifs, setNotifs]    = useState([]);
  const [unread, setUnread]    = useState(0);
  const [open, setOpen]        = useState(false);
  const [loading, setLoading]  = useState(false);
  const ref                    = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifs(data.notifications);
      setUnread(data.unreadCount);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Real-time push from socket
  useEffect(() => {
    if (!socket) return;
    const handle = (n) => {
      setNotifs(prev => [n, ...prev].slice(0, 50));
      setUnread(u => u + 1);
    };
    socket.on('notification', handle);
    return () => socket.off('notification', handle);
  }, [socket]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await api.patch(`/notifications/${n._id}/read`);
      setNotifs(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
      setUnread(u => Math.max(0, u - 1));
    }
    if (n.link && onNavigate) onNavigate(n.link, n.type);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(v => !v); if (!open) load(); }}
        style={{
          width: 34, height: 34, borderRadius: 8,
          background: open ? 'var(--bg3)' : 'transparent',
          border: '1px solid ' + (open ? 'var(--border2)' : 'transparent'),
          color: 'var(--text2)', cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', transition: 'all 150ms',
        }}
        title="Notifications"
      >
        🔔
        {/* 🕭 */}

        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 3, right: 3,
            width: 16, height: 16, borderRadius: 8,
            background: 'var(--red)', color: '#fff',
            fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 42, right: 0,
          width: 340, maxHeight: 420,
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 300, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{
                fontSize: 11, color: 'var(--accent)', background: 'none',
                border: 'none', cursor: 'pointer',
              }}>Mark all read</button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                <div className="spinner" />
              </div>
            )}
            {!loading && notifs.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
                No notifications yet
              </div>
            )}
            {notifs.map(n => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex', gap: 10, padding: '11px 16px',
                  cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  background: n.isRead ? 'transparent' : 'rgba(108,143,255,0.05)',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={e => (e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(108,143,255,0.05)')}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: 'var(--bg3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 14,
                }}>
                  {TYPE_ICON[n.type] || '◎'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 500, color: 'var(--text)' }}>
                    {n.title}
                  </div>
                  {n.body && (
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.body}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </div>
                {!n.isRead && (
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)', marginTop: 4, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}