import { create } from 'zustand';

export interface UserSession {
  userId: number;
  username: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  role: string;
  station: string;
  token: string;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  activeStation: string;
  setActiveStation: (station: string) => void;
  setUser: (user: UserSession | null) => void;
  login: (user: UserSession) => void;
  logout: () => void;
  loginWithDemo: () => void;
}

// Hydrate from localStorage if existing session exists
const savedToken = localStorage.getItem('tsm_auth_token');
const savedUserStr = localStorage.getItem('tsm_user');

let initialUser: UserSession | null = null;
if (savedToken && savedUserStr) {
  try {
    initialUser = JSON.parse(savedUserStr);
  } catch {
    initialUser = null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!(savedToken && initialUser),
  activeStation: initialUser?.station || 'Central Kitchen - Main Pod',

  setActiveStation: (station: string) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, station } : null;
      if (updatedUser) {
        localStorage.setItem('tsm_user', JSON.stringify(updatedUser));
      }
      return { activeStation: station, user: updatedUser };
    }),

  setUser: (user: UserSession | null) =>
    set({ user, isAuthenticated: !!user }),

  login: (user: UserSession) => {
    localStorage.setItem('tsm_auth_token', user.token);
    localStorage.setItem('tsm_user', JSON.stringify(user));
    set({
      user,
      isAuthenticated: true,
      activeStation: user.station || 'Central Kitchen - Main Pod',
    });
  },

  logout: () => {
    localStorage.removeItem('tsm_auth_token');
    localStorage.removeItem('tsm_user');
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  loginWithDemo: () => {
    const demoUser: UserSession = {
      userId: 1,
      username: 'm.rossi@kitchenops.io',
      fullName: 'Marco Rossi (Admin)',
      email: 'm.rossi@kitchenops.io',
      role: 'Admin',
      station: 'Central Kitchen #04',
      token: 'demo_jwt_token_admin_2026',
    };
    localStorage.setItem('tsm_auth_token', demoUser.token);
    localStorage.setItem('tsm_user', JSON.stringify(demoUser));
    set({
      user: demoUser,
      isAuthenticated: true,
      activeStation: demoUser.station,
    });
  },
}));
