import { User } from '@/actions/auth.entity';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  user: User | null;
  language: string;
  hydrated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      language: 'en',
      user: null,
      hydrated: false,
      setUser: (user: User) => set({ user }),
      logout: () => {
        set({ user: null });
        localStorage.removeItem('cards');
        localStorage.removeItem('message-storage');
      },
    }),
    {
      name: 'auth-storage', 
      onRehydrateStorage: () => (state) => {
        state!.hydrated = true;
      },
    }
  )
);
