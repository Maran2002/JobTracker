import { create } from 'zustand';
import api from '../api/gateway';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  pushPermission: typeof Notification !== 'undefined' ? Notification.permission : 'default',

  /* ── Fetch all notifications from backend ── */
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notifications');
      const unread = data.filter(n => !n.read).length;
      set({ notifications: data, unreadCount: unread, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  /* ── Mark a single notification as read ── */
  markRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map(n =>
          n._id === id ? { ...n, read: true } : n
        );
        return { notifications: updated, unreadCount: updated.filter(n => !n.read).length };
      });
    } catch { /* silent */ }
  },

  /* ── Mark all as read ── */
  markAllRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch { /* silent */ }
  },

  /* ── Delete single notification ── */
  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => {
        const updated = state.notifications.filter(n => n._id !== id);
        return { notifications: updated, unreadCount: updated.filter(n => !n.read).length };
      });
    } catch { /* silent */ }
  },

  /* ── Clear all ── */
  clearAll: async () => {
    try {
      await api.delete('/notifications');
      set({ notifications: [], unreadCount: 0 });
    } catch { /* silent */ }
  },

  /* ── Add a notification locally (optimistic, e.g. from push) ── */
  addLocal: (notif) => {
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  /* ── Request browser push permission + subscribe ── */
  requestPushPermission: async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return 'unsupported';
    }
    const permission = await Notification.requestPermission();
    set({ pushPermission: permission });

    if (permission === 'granted') {
      try {
        // Get VAPID public key from backend
        const { data } = await api.get('/user/vapid-public-key');
        const { publicKey } = data;

        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        const sub = existing || await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        await api.post('/user/push-subscribe', { subscription: sub.toJSON() });
      } catch (err) {
        console.error('[push] Subscription failed', err);
      }
    }
    return permission;
  },

  /* ── Unsubscribe from push ── */
  unsubscribePush: async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.delete('/user/push-subscribe', { data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
    } catch (err) {
      console.error('[push] Unsubscribe failed', err);
    }
    set({ pushPermission: 'default' });
  },
}));

/* helper: base64 → Uint8Array for VAPID key */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export default useNotificationStore;
