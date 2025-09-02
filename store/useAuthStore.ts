import { User } from '@/actions/auth.entity';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  language: string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      language: 'en',
      user: null,
      setUser: (user: User) => set({ user }),
      logout: () => {
        set({ user: null });
        localStorage.removeItem('cards');
        localStorage.removeItem('message-storage');
        location.replace('/');
      },
    }),
    {
      name: 'auth-storage', 
    }
  )
);
