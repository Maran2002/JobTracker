/**
 * Date/time formatting utilities — pull from usePreferencesStore for user settings.
 *
 * These are thin convenience wrappers so other pages don't need to import
 * the store directly when they only need a quick one-off format.
 *
 * Usage:
 *   import { useDateFormatter } from '../utils/dateTime';
 *   const { formatDate, formatTime } = useDateFormatter();
 */

import usePreferencesStore from '../store/usePreferencesStore';

/**
 * React hook — returns bound formatDate / formatTime from the preferences store.
 * Re-renders when relevant preferences change.
 */
export function useDateFormatter() {
  const formatDate = usePreferencesStore((s) => s.formatDate);
  const formatTime = usePreferencesStore((s) => s.formatTime);
  return { formatDate, formatTime };
}

/**
 * Non-hook snapshot version — safe to call outside React components.
 */
export function formatDateNow(value) {
  return usePreferencesStore.getState().formatDate(value);
}

export function formatTimeNow(value) {
  return usePreferencesStore.getState().formatTime(value);
}

/**
 * Popular IANA timezone list for the Settings picker.
 */
export const TIMEZONES = [
  { value: 'auto',                label: 'Auto (browser default)' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii (HST, UTC−10)' },
  { value: 'America/Anchorage',   label: 'Alaska (AKST, UTC−9)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PST/PDT, UTC−8/−7)' },
  { value: 'America/Denver',      label: 'Mountain (MST/MDT, UTC−7/−6)' },
  { value: 'America/Chicago',     label: 'Central (CST/CDT, UTC−6/−5)' },
  { value: 'America/New_York',    label: 'Eastern (EST/EDT, UTC−5/−4)' },
  { value: 'America/Sao_Paulo',   label: 'Brazil (BRT, UTC−3)' },
  { value: 'Europe/London',       label: 'London (GMT/BST, UTC+0/+1)' },
  { value: 'Europe/Paris',        label: 'Paris / Berlin (CET, UTC+1/+2)' },
  { value: 'Europe/Helsinki',     label: 'Helsinki / Kyiv (EET, UTC+2/+3)' },
  { value: 'Europe/Moscow',       label: 'Moscow (MSK, UTC+3)' },
  { value: 'Asia/Dubai',          label: 'Dubai (GST, UTC+4)' },
  { value: 'Asia/Karachi',        label: 'Karachi / Islamabad (PKT, UTC+5)' },
  { value: 'Asia/Kolkata',        label: 'India (IST, UTC+5:30)' },
  { value: 'Asia/Dhaka',          label: 'Dhaka (BST, UTC+6)' },
  { value: 'Asia/Bangkok',        label: 'Bangkok / Jakarta (WIB, UTC+7)' },
  { value: 'Asia/Singapore',      label: 'Singapore / KL (SGT, UTC+8)' },
  { value: 'Asia/Shanghai',       label: 'China (CST, UTC+8)' },
  { value: 'Asia/Tokyo',          label: 'Japan / Korea (JST, UTC+9)' },
  { value: 'Australia/Adelaide',  label: 'Adelaide (ACST, UTC+9:30)' },
  { value: 'Australia/Sydney',    label: 'Sydney / Melbourne (AEST, UTC+10)' },
  { value: 'Pacific/Auckland',    label: 'New Zealand (NZST, UTC+12)' },
];

export const DATE_FORMATS = [
  { value: 'MMM DD, YYYY', label: 'Jan 15, 2025',  example: 'Jan 15, 2025'  },
  { value: 'DD MMM YYYY',  label: '15 Jan 2025',   example: '15 Jan 2025'   },
  { value: 'MM/DD/YYYY',   label: '01/15/2025',    example: '01/15/2025'    },
  { value: 'DD/MM/YYYY',   label: '15/01/2025',    example: '15/01/2025'    },
  { value: 'YYYY-MM-DD',   label: '2025-01-15',    example: '2025-01-15'    },
];

export const TIME_FORMATS = [
  { value: '12h', label: '12-hour  (02:30 PM)' },
  { value: '24h', label: '24-hour  (14:30)'     },
];
