import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createAuthSlice, AuthSlice } from './slices/authSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createClientSlice, ClientSlice } from './slices/clientSlice';
import { createInvoiceSlice, InvoiceSlice } from './slices/invoiceSlice';
import { createNotificationSlice, NotificationSlice } from './slices/notificationSlice';

/**
 * Root store type
 */
export type AppStore = AuthSlice & UISlice & ProjectSlice & ClientSlice & InvoiceSlice & NotificationSlice;

/**
 * Create the root store
 */
export const useStore = create<AppStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get, store) => ({
          ...createAuthSlice(set, get, store),
          ...createUISlice(set, get, store),
          ...createProjectSlice(set, get, store),
          ...createClientSlice(set, get, store),
          ...createInvoiceSlice(set, get, store),
          ...createNotificationSlice(set, get, store),
        })),
        {
          name: 'ruzma-store',
          partialize: (state) => ({
            // Only persist specific parts of the store
            theme: state.theme,
            language: state.language,
            sidebarOpen: state.sidebarOpen,
            user: state.user,
            profile: state.profile,
            preferences: state.preferences,
            draftInvoice: state.draftInvoice,
          }),
        }
      )
    ),
    {
      name: 'RuzmaStore',
    }
  )
);

/**
 * Selectors for common use cases
 */
export const selectors = {
  // Auth selectors
  isAuthenticated: (state: AppStore) => !!state.user,
  currentUser: (state: AppStore) => state.user,
  userProfile: (state: AppStore) => state.profile,
  
  // UI selectors
  currentTheme: (state: AppStore) => state.theme,
  currentLanguage: (state: AppStore) => state.language,
  isSidebarOpen: (state: AppStore) => state.sidebarOpen,
  
  // Project selectors
  activeProjects: (state: AppStore) => state.projects.filter(p => p.status === 'active'),
  projectById: (id: string) => (state: AppStore) => state.projects.find(p => p.id === id),
  
  // Client selectors
  clientById: (id: string) => (state: AppStore) => state.clients.find(c => c.id === id),
  
  // Invoice selectors
  unpaidInvoices: (state: AppStore) => state.invoices.filter(i => i.status !== 'paid'),
  
  // Notification selectors
  unreadNotifications: (state: AppStore) => state.notifications.filter(n => !n.read),
  hasUnreadNotifications: (state: AppStore) => state.notifications.some(n => !n.read),
};


// Make store available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).store = useStore;
}

// Export individual slice stores for specific use cases
export { useStore as default };
export * from './slices/authSlice';
export * from './slices/uiSlice';
export * from './slices/projectSlice';
export * from './slices/clientSlice';
export * from './slices/invoiceSlice';
export * from './slices/notificationSlice';