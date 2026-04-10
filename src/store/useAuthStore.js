import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],

      login: (userData, token) => set({
        user: userData,
        token: token,
        isAuthenticated: true,
        permissions: userData.permissions || [],
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        permissions: [],
      }),

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
      })),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useAuthStore;
