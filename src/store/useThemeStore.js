import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' | 'dark'

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        set({ theme: newTheme });
      },

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      // Call once on app mount to restore persisted theme
      initTheme: () => {
        applyTheme(get().theme);
      },
    }),
    { name: 'ct-theme-v1' }
  )
);

export default useThemeStore;
