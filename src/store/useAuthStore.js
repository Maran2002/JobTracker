import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/gateway';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],

      /** Full login — stores returned data, then fetches full profile (incl. bio) */
      login: async (userData, token) => {
        set({
          user: userData,
          token,
          isAuthenticated: true,
          permissions: userData.permissions || [],
        });
        // Hydrate full profile (bio, isTwoFactorEnabled, etc.) from /api/user/me
        try {
          const { data } = await api.get('/user/me');
          set((state) => ({ user: { ...state.user, ...data } }));
        } catch {
          // Non-critical — proceed with login data
        }
      },

      /** Update a subset of user fields (used by Settings, etc.) */
      updateUser: (userData) =>
        set((state) => ({ user: { ...state.user, ...userData } })),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: [],
        }),
    }),
    {
      name: 'ct-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
