import { create } from 'zustand';
import { User, LoginCredentials, AuthResponse } from '../types/User';
import { AuthService } from '../services/AuthService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearUser: () => void;
  clearError: () => void;
  refreshToken: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const authResponse = await AuthService.login(credentials);
      
      set({
        user: authResponse.user,
        token: authResponse.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },
  
  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },
  
  setToken: (token: string) => {
    set({ token });
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  clearUser: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  refreshToken: async () => {
    try {
      const authResponse = await AuthService.refreshToken();
      set({ 
        token: authResponse.token,
        user: authResponse.user 
      });
    } catch (error) {
      get().logout();
      throw error;
    }
  },

  initializeAuth: async () => {
    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      if (isAuthenticated) {
        const user = await AuthService.getUser();
        const token = await AuthService.getToken();
        
        if (user && token) {
          set({
            user,
            token,
            isAuthenticated: true,
          });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },
}));
