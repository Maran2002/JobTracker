import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],

      // Real API login (placeholder)
      login: (userData, token) =>
        set({
          user: userData,
          token,
          isAuthenticated: true,
          permissions: userData.permissions || [],
        }),

      // Demo login — no API call required
      mockLogin: (email, _password) => {
        const userData = {
          name: 'Siddharth',
          email,
          role: 'Premium Member',
          avatar: null,
          permissions: ['all'],
        };
        set({
          user: userData,
          token: 'demo-token-abc123',
          isAuthenticated: true,
          permissions: userData.permissions,
        });
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: [],
        }),

      updateUser: (userData) =>
        set((state) => ({ user: { ...state.user, ...userData } })),
    }),
    {
      name: 'ct-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
