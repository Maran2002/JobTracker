import React, { useEffect, useState } from 'react';
import {
  Bell, CheckCheck, Trash2, X, Calendar, Briefcase, Layout,
  Info, Loader2, BellOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotificationStore from '../store/useNotificationStore';

/* ── Type → icon + color map ── */
const TYPE_META = {
  interview:   { icon: Calendar,  color: '#10b981' },
  application: { icon: Briefcase, color: '#4f46e5' },
  reminder:    { icon: Bell,      color: '#f59e0b' },
  offer:       { icon: Layout,    color: '#06b6d4' },
  rejection:   { icon: X,         color: '#ef4444' },
  system:      { icon: Info,      color: '#8b5cf6' },
};

/* ── Relative time ── */
const relTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'Just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  return new Date(date).toLocaleDateString();
};

/* ── Single notification card ── */
const NotifCard = ({ notif, onRead, onDelete }) => {
  const { icon: Icon, color } = TYPE_META[notif.type] || TYPE_META.system;
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notif.read) onRead(notif._id);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        padding: '16px 18px', borderRadius: '14px', cursor: notif.link ? 'pointer' : 'default',
        background: notif.read ? 'var(--ct-card)' : 'var(--ct-primary-light)',
        border: `1.5px solid ${notif.read ? 'var(--ct-border)' : `rgba(var(--ct-primary-rgb),0.2)`}`,
        marginBottom: '10px', transition: 'all 0.18s',
        position: 'relative',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Icon */}
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} style={{ color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontWeight: notif.read ? '600' : '700', fontSize: '14px', color: 'var(--ct-text)' }}>
            {notif.title}
          </span>
          {!notif.read && (
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--ct-primary)', flexShrink: 0 }} />
          )}
        </div>
        {notif.body && (
          <div style={{ fontSize: '13px', color: 'var(--ct-text-muted)', lineHeight: '1.5', marginBottom: '5px' }}>
            {notif.body}
          </div>
        )}
        <div style={{ fontSize: '11px', color: 'var(--ct-text-muted)', fontWeight: '500' }}>
          {relTime(notif.createdAt)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        {!notif.read && (
          <button
            onClick={(e) => { e.stopPropagation(); onRead(notif._id); }}
            title="Mark as read"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ct-primary)', padding: '4px', borderRadius: '6px', display: 'flex' }}
          >
            <CheckCheck size={13} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notif._id); }}
          title="Delete"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ct-text-muted)', padding: '4px', borderRadius: '6px', display: 'flex' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ct-danger)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ct-text-muted)'; }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

/* ═══════════ MAIN PAGE ═══════════ */
const Notifications = () => {
  const {
    notifications, loading, unreadCount,
    fetchNotifications, markRead, markAllRead,
    deleteNotification, clearAll,
  } = useNotificationStore();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [clearing, setClearing] = useState(false);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read')   return n.read;
    return true;
  });

  const handleClearAll = async () => {
    setClearing(true);
    await clearAll();
    setClearing(false);
  };

  const TABS = [
    { key: 'all',    label: 'All',    count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'read',   label: 'Read',   count: notifications.filter(n => n.read).length },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '26px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'You\'re all caught up!'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {unreadCount > 0 && (
            <button className="btn-secondary" onClick={markAllRead} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll} disabled={clearing}
              style={{ fontSize: '13px', padding: '8px 16px', borderRadius: 'var(--ct-radius-sm)', border: '1px solid var(--ct-danger)', color: 'var(--ct-danger)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', transition: 'all 0.18s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ct-danger)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--ct-danger)'; }}
            >
              {clearing ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {TABS.map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{
              padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.18s', border: 'none',
              background: filter === key ? 'var(--ct-primary)' : 'var(--ct-card)',
              color: filter === key ? '#fff' : 'var(--ct-text-muted)',
              boxShadow: filter === key ? '0 3px 10px var(--ct-primary-shadow)' : 'none',
            }}>
            {label}
            {count > 0 && (
              <span style={{
                marginLeft: '6px', fontSize: '11px', fontWeight: '700',
                background: filter === key ? 'rgba(255,255,255,0.25)' : 'var(--ct-bg)',
                padding: '1px 6px', borderRadius: '10px',
              }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'var(--ct-text-muted)', gap: '10px' }}>
          <Loader2 size={18} className="spin" />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Loading notifications…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'var(--ct-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <BellOff size={32} style={{ color: 'var(--ct-primary)', opacity: 0.5 }} />
          </div>
          <div style={{ fontWeight: '700', fontSize: '17px', color: 'var(--ct-text)', marginBottom: '8px' }}>
            {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ct-text-muted)', maxWidth: '280px', margin: '0 auto' }}>
            {filter === 'all' ? 'Notifications about your applications and interviews will appear here.' : `Switch to a different filter to see more.`}
          </div>
        </div>
      ) : (
        <div>
          {filtered.map((n) => (
            <NotifCard
              key={n._id}
              notif={n}
              onRead={markRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
