import { create } from 'zustand';

export interface UserSession {
  userId: number;
  username: string;
  fullName: string;
  role: string;
  station: string;
  token: string;
}

interface AuthState {
  user: UserSession;
  activeStation: string;
  setActiveStation: (station: string) => void;
  setUser: (user: UserSession) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    userId: 1,
    username: 'ops_manager_sunil',
    fullName: 'Sunil Nair',
    role: 'Operations Lead',
    station: 'Central Kitchen - Main Pod',
    token: 'jwt_ops_lead_sample_token',
  },
  activeStation: 'Central Kitchen - Main Pod',
  setActiveStation: (station: string) => set({ activeStation: station }),
  setUser: (user: UserSession) => set({ user }),
}));
