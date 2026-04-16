import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/gateway';

/* ─── Defaults ─────────────────────────────────────────────── */
const DEFAULTS = {
  dateFormat:  'MMM DD, YYYY',
  timeFormat:  '12h',
  timezone:    'auto',
  accentColor: '#4f46e5',
  notifications: {
    interview:    true,
    applications: true,
    weekly:       false,
    reminders:    false,
    marketing:    false,
  },
};

/* ─── Accent-color helpers ──────────────────────────────────── */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function darkenHex(hex, amount = 18) {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const d = (v) => clamp(v - amount).toString(16).padStart(2, '0');
  return `#${d(r)}${d(g)}${d(b)}`;
}

export function applyAccentColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const root = document.documentElement;
  
  // Calculate variations
  const dark = darkenHex(hex, 20);
  
  root.style.setProperty('--ct-primary',             hex);
  root.style.setProperty('--ct-primary-hover',       dark);
  root.style.setProperty('--ct-primary-dark',        dark);
  root.style.setProperty('--ct-primary-light',       `rgba(${r},${g},${b},0.08)`);
  root.style.setProperty('--ct-primary-rgb',         `${r},${g},${b}`);
  root.style.setProperty('--ct-sidebar-active-bg',   `rgba(${r},${g},${b},0.18)`);
  root.style.setProperty('--ct-sidebar-active-border', hex);
  root.style.setProperty('--ct-sidebar-active-text', '#ffffff');
  
  // Added for gradients and box shadows
  root.style.setProperty('--ct-primary-shadow',      `rgba(${r},${g},${b},0.28)`);
  root.style.setProperty('--ct-primary-shadow-lg',   `rgba(${r},${g},${b},0.42)`);
}

/* ─── Store ─────────────────────────────────────────────────── */
const usePreferencesStore = create(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      isLoaded: false,

      /** Call once on app mount to restore CSS variables from persisted state */
      initPreferences: () => {
        applyAccentColor(get().accentColor || DEFAULTS.accentColor);
      },

      /** Load preferences from the backend (called after auth) */
      fetchPreferences: async () => {
        try {
          const { data } = await api.get('/user/preferences');
          const merged = { ...DEFAULTS, ...data };
          set({ ...merged, isLoaded: true });
          applyAccentColor(merged.accentColor);
        } catch {
          set({ isLoaded: true });
        }
      },

      /** Optimistically update local state + persist to backend */
      updatePreferences: async (updates) => {
        const s = get();
        const next = {
          dateFormat:  s.dateFormat,
          timeFormat:  s.timeFormat,
          timezone:    s.timezone,
          accentColor: s.accentColor,
          notifications: { ...s.notifications },
          ...updates,
          notifications: {
            ...s.notifications,
            ...(updates.notifications || {}),
          },
        };
        set(next);
        if (updates.accentColor) applyAccentColor(updates.accentColor);
        try {
          await api.put('/user/preferences', { preferences: next });
        } catch (e) {
          console.error('[preferences] save failed', e);
        }
      },

      /** Resolve the effective timezone string for Intl */
      resolvedTimezone: () => {
        const tz = get().timezone;
        if (!tz || tz === 'auto') return Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz;
      },

      /**
       * Format a date value using the user's preferences.
       * Accepts: Date object | ISO string "2024-05-24" | natural string "May 24, 2024"
       */
      formatDate: (value) => {
        if (!value) return '';
        const { dateFormat } = get();
        const tz = get().resolvedTimezone();

        const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const pad = (n) => String(n).padStart(2, '0');

        let year, month, day; // 0-based month

        if (value instanceof Date) {
          // Apply timezone
          const local = new Date(value.toLocaleString('en-US', { timeZone: tz }));
          year = local.getFullYear(); month = local.getMonth(); day = local.getDate();
        } else {
          const s = String(value).trim();
          const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (isoMatch) {
            // Pure date string — treat as local, no tz shift
            year = parseInt(isoMatch[1]); month = parseInt(isoMatch[2]) - 1; day = parseInt(isoMatch[3]);
          } else {
            // Natural string like "May 24, 2024" — parse then apply tz
            const d = new Date(s);
            if (isNaN(d.getTime())) return s;
            const local = new Date(d.toLocaleString('en-US', { timeZone: tz }));
            year = local.getFullYear(); month = local.getMonth(); day = local.getDate();
          }
        }

        switch (dateFormat) {
          case 'MM/DD/YYYY':  return `${pad(month+1)}/${pad(day)}/${year}`;
          case 'DD/MM/YYYY':  return `${pad(day)}/${pad(month+1)}/${year}`;
          case 'YYYY-MM-DD':  return `${year}-${pad(month+1)}-${pad(day)}`;
          case 'DD MMM YYYY': return `${pad(day)} ${MONTHS_SHORT[month]} ${year}`;
          case 'MMM DD, YYYY':
          default:            return `${MONTHS_SHORT[month]} ${pad(day)}, ${year}`;
        }
      },

      /**
       * Format a time string using the user's preferences.
       * Accepts: "14:30" | "2:30 PM" | Date object
       */
      formatTime: (value) => {
        if (!value) return '';
        const { timeFormat } = get();

        let hours, minutes;

        if (value instanceof Date) {
          hours   = value.getHours();
          minutes = value.getMinutes();
        } else {
          const s = String(value).trim();
          // "HH:MM" 24-hour
          const hm = s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
          if (hm) {
            hours   = parseInt(hm[1]);
            minutes = parseInt(hm[2]);
            const meridiem = (hm[3] || '').toUpperCase();
            if (meridiem === 'PM' && hours < 12) hours += 12;
            if (meridiem === 'AM' && hours === 12) hours = 0;
          } else {
            return value;
          }
        }

        const pad = (n) => String(n).padStart(2, '0');
        if (timeFormat === '24h') {
          return `${pad(hours)}:${pad(minutes)}`;
        }
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h12  = hours % 12 || 12;
        return `${pad(h12)}:${pad(minutes)} ${ampm}`;
      },
    }),
    {
      name: 'ct-preferences-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        dateFormat:    s.dateFormat,
        timeFormat:    s.timeFormat,
        timezone:      s.timezone,
        accentColor:   s.accentColor,
        notifications: s.notifications,
      }),
    }
  )
);

export default usePreferencesStore;
