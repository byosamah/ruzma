import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Import both old and new slices
import { createAuthSlice as createOldAuthSlice, AuthSlice as OldAuthSlice } from './slices/authSlice';
import { createAuthSlice as createNewAuthSlice, AuthSlice as NewAuthSlice } from './slices/authSlice.v2';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createClientSlice, ClientSlice } from './slices/clientSlice';
import { createInvoiceSlice, InvoiceSlice } from './slices/invoiceSlice';
import { createNotificationSlice, NotificationSlice } from './slices/notificationSlice';

// Import services and migration flags
import { getAuthService, getProjectService } from '@/lib/services';
import { getMigrationFlags } from './migration';

/**
 * Hybrid store type that can use either old or new slices
 */
export type HybridAuthSlice = OldAuthSlice | NewAuthSlice;
export type HybridAppStore = HybridAuthSlice & UISlice & ProjectSlice & ClientSlice & InvoiceSlice & NotificationSlice;

/**
 * Create the hybrid store with conditional slice selection
 */
export const useHybridStore = create<HybridAppStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get, store) => {
          const flags = getMigrationFlags();
          
          // Conditionally select auth slice implementation
          const authSlice = flags.USE_NEW_AUTH_SLICE
            ? createNewAuthSlice(getAuthService())(set, get, store)
            : createOldAuthSlice(set, get, store);
          
          // TODO: Add conditional logic for other slices as they're migrated
          // const projectSlice = flags.USE_NEW_PROJECT_SLICE
          //   ? createNewProjectSlice(getProjectService())(set, get, store)
          //   : createProjectSlice(set, get, store);
          
          return {
            ...authSlice,
            ...createUISlice(set, get, store),
            ...createProjectSlice(set, get, store),
            ...createClientSlice(set, get, store),
            ...createInvoiceSlice(set, get, store),
            ...createNotificationSlice(set, get, store),
          };
        }),
        {
          name: 'ruzma-hybrid-store',
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
      name: 'RuzmaHybridStore',
    }
  )
);

/**
 * Selectors work the same regardless of which slice implementation is used
 */
export const hybridSelectors = {
  // Auth selectors
  isAuthenticated: (state: HybridAppStore) => !!state.user,
  currentUser: (state: HybridAppStore) => state.user,
  userProfile: (state: HybridAppStore) => state.profile,
  
  // UI selectors
  currentTheme: (state: HybridAppStore) => state.theme,
  currentLanguage: (state: HybridAppStore) => state.language,
  isSidebarOpen: (state: HybridAppStore) => state.sidebarOpen,
  
  // Project selectors
  activeProjects: (state: HybridAppStore) => state.projects.filter(p => p.status === 'active'),
  projectById: (id: string) => (state: HybridAppStore) => state.projects.find(p => p.id === id),
  
  // Client selectors
  clientById: (id: string) => (state: HybridAppStore) => state.clients.find(c => c.id === id),
  
  // Invoice selectors
  unpaidInvoices: (state: HybridAppStore) => state.invoices.filter(i => i.status !== 'paid'),
  
  // Notification selectors
  unreadNotifications: (state: HybridAppStore) => state.notifications.filter(n => !n.read),
  hasUnreadNotifications: (state: HybridAppStore) => state.notifications.some(n => !n.read),
};

// Make store available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).hybridStore = useHybridStore;
  (window as any).migrationFlags = getMigrationFlags();
}

// Export for use in the application
export { useHybridStore as useStore };
export * from './slices/authSlice';
export * from './slices/authSlice.v2';
export * from './slices/uiSlice';
export * from './slices/projectSlice';
export * from './slices/clientSlice';
export * from './slices/invoiceSlice';
export * from './slices/notificationSlice';