import { StateCreator } from 'zustand';
import { THEMES, LANGUAGES, ANIMATION_DURATION } from '@/lib/constants';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
}

export interface UISlice {
  // Theme
  theme: typeof THEMES[keyof typeof THEMES];
  setTheme: (theme: typeof THEMES[keyof typeof THEMES]) => void;
  
  // Language
  language: typeof LANGUAGES[keyof typeof LANGUAGES];
  setLanguage: (language: typeof LANGUAGES[keyof typeof LANGUAGES]) => void;
  
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Mobile navigation
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Modals
  modals: Modal[];
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  loadingTasks: Map<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  
  // Preferences
  preferences: {
    compactMode: boolean;
    showNotifications: boolean;
    soundEnabled: boolean;
    autoSave: boolean;
  };
  updatePreferences: (preferences: Partial<UISlice['preferences']>) => void;
}

export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  // Theme
  theme: THEMES.LIGHT,
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('ruzma_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },
  
  // Language
  language: LANGUAGES.EN,
  setLanguage: (language) => {
    set({ language });
    localStorage.setItem('ruzma_language', language);
    document.documentElement.setAttribute('dir', language === LANGUAGES.AR ? 'rtl' : 'ltr');
  },
  
  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  // Mobile navigation
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  
  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}`;
    const newToast = { ...toast, id };
    
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration || 5000);
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },
  clearToasts: () => set({ toasts: [] }),
  
  // Modals
  modals: [],
  openModal: (modal) => {
    const id = `modal-${Date.now()}`;
    set((state) => ({
      modals: [...state.modals, { ...modal, id }]
    }));
  },
  closeModal: (id) => {
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id)
    }));
  },
  closeAllModals: () => set({ modals: [] }),
  
  // Loading states
  globalLoading: false,
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
  loadingTasks: new Map(),
  setLoading: (key, loading) => {
    set((state) => {
      const newTasks = new Map(state.loadingTasks);
      if (loading) {
        newTasks.set(key, true);
      } else {
        newTasks.delete(key);
      }
      return { loadingTasks: newTasks };
    });
  },
  isLoading: (key) => get().loadingTasks.has(key),
  
  // Preferences
  preferences: {
    compactMode: false,
    showNotifications: true,
    soundEnabled: false,
    autoSave: true,
  },
  updatePreferences: (preferences) => {
    set((state) => ({
      preferences: { ...state.preferences, ...preferences }
    }));
    localStorage.setItem('ruzma_preferences', JSON.stringify(get().preferences));
  },
});