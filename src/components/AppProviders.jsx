'use client';

import { useEffect } from 'react';
import { Toaster } from 'vibe-toast';
import useThemeStore from '../store/useThemeStore';
import usePreferencesStore from '../store/usePreferencesStore';
import useAuthStore from '../store/useAuthStore';

export default function AppProviders({ children }) {
  const initTheme = useThemeStore((state) => state.initTheme);
  const initPreferences = usePreferencesStore((state) => state.initPreferences);
  useEffect(() => {
    useAuthStore.getState().clearLegacyToken();
    initTheme();
    usePreferencesStore.persist.rehydrate();
    initPreferences();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, [initTheme, initPreferences]);
  return <><Toaster position="top-right" richColors closeButton />{children}</>;
}
