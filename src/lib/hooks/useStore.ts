import { useStore as useAppStore } from '@/lib/store';
import { shallow } from 'zustand/shallow';
import type { AppStore } from '@/lib/store';

/**
 * Custom hooks for accessing store slices
 */

// Auth hooks
export const useAuth = () => {
  return useAppStore(
    (state) => ({
      user: state.user,
      profile: state.profile,
      isLoading: state.isLoading,
      isInitialized: state.isInitialized,
      login: state.login,
      logout: state.logout,
      signUp: state.signUp,
      updateProfile: state.updateProfile,
      refreshAuth: state.refreshAuth,
    }),
    shallow
  );
};

export const useUser = () => useAppStore((state) => state.user);
export const useProfile = () => useAppStore((state) => state.profile);
export const useIsAuthenticated = () => useAppStore((state) => !!state.user);

// UI hooks
export const useUI = () => {
  return useAppStore(
    (state) => ({
      theme: state.theme,
      setTheme: state.setTheme,
      language: state.language,
      setLanguage: state.setLanguage,
      sidebarOpen: state.sidebarOpen,
      setSidebarOpen: state.setSidebarOpen,
      toggleSidebar: state.toggleSidebar,
      mobileMenuOpen: state.mobileMenuOpen,
      setMobileMenuOpen: state.setMobileMenuOpen,
    }),
    shallow
  );
};

export const useToasts = () => {
  return useAppStore(
    (state) => ({
      toasts: state.toasts,
      addToast: state.addToast,
      removeToast: state.removeToast,
      clearToasts: state.clearToasts,
    }),
    shallow
  );
};

export const useModals = () => {
  return useAppStore(
    (state) => ({
      modals: state.modals,
      openModal: state.openModal,
      closeModal: state.closeModal,
      closeAllModals: state.closeAllModals,
    }),
    shallow
  );
};

export const useLoading = () => {
  return useAppStore(
    (state) => ({
      globalLoading: state.globalLoading,
      setGlobalLoading: state.setGlobalLoading,
      setLoading: state.setLoading,
      isLoading: state.isLoading,
    }),
    shallow
  );
};

export const usePreferences = () => {
  return useAppStore(
    (state) => ({
      preferences: state.preferences,
      updatePreferences: state.updatePreferences,
    }),
    shallow
  );
};

// Project hooks
export const useProjects = () => {
  return useAppStore(
    (state) => ({
      projects: state.projects,
      currentProject: state.currentProject,
      filters: state.filters,
      totalCount: state.totalCount,
      isLoading: state.isLoading,
      error: state.error,
      fetchProjects: state.fetchProjects,
      fetchProject: state.fetchProject,
      createProject: state.createProject,
      updateProject: state.updateProject,
      deleteProject: state.deleteProject,
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
    }),
    shallow
  );
};

export const useProjectById = (id: string) => {
  return useAppStore((state) => state.getProjectById(id));
};

export const useActiveProjects = () => {
  return useAppStore((state) => state.getActiveProjects());
};

// Client hooks
export const useClients = () => {
  return useAppStore(
    (state) => ({
      clients: state.clients,
      currentClient: state.currentClient,
      filters: state.filters,
      totalCount: state.totalCount,
      isLoading: state.isLoading,
      error: state.error,
      fetchClients: state.fetchClients,
      fetchClient: state.fetchClient,
      createClient: state.createClient,
      updateClient: state.updateClient,
      deleteClient: state.deleteClient,
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
    }),
    shallow
  );
};

export const useClientById = (id: string) => {
  return useAppStore((state) => state.getClientById(id));
};

export const useClientSearch = (query: string) => {
  return useAppStore((state) => state.searchClients(query));
};

// Invoice hooks
export const useInvoices = () => {
  return useAppStore(
    (state) => ({
      invoices: state.invoices,
      currentInvoice: state.currentInvoice,
      draftInvoice: state.draftInvoice,
      filters: state.filters,
      totalCount: state.totalCount,
      statistics: state.statistics,
      isLoading: state.isLoading,
      error: state.error,
      fetchInvoices: state.fetchInvoices,
      fetchInvoice: state.fetchInvoice,
      fetchStatistics: state.fetchStatistics,
      createInvoice: state.createInvoice,
      updateInvoice: state.updateInvoice,
      deleteInvoice: state.deleteInvoice,
      sendInvoice: state.sendInvoice,
      markAsPaid: state.markAsPaid,
      setDraftInvoice: state.setDraftInvoice,
      updateDraftInvoice: state.updateDraftInvoice,
      generateInvoiceNumber: state.generateInvoiceNumber,
    }),
    shallow
  );
};

export const useInvoiceById = (id: string) => {
  return useAppStore((state) => state.getInvoiceById(id));
};

export const useOverdueInvoices = () => {
  return useAppStore((state) => state.getOverdueInvoices());
};

// Notification hooks
export const useNotifications = () => {
  return useAppStore(
    (state) => ({
      notifications: state.notifications,
      unreadCount: state.unreadCount,
      filters: state.filters,
      isLoading: state.isLoading,
      error: state.error,
      fetchNotifications: state.fetchNotifications,
      markAsRead: state.markAsRead,
      markAllAsRead: state.markAllAsRead,
      deleteNotification: state.deleteNotification,
      clearAll: state.clearAll,
      subscribeToNotifications: state.subscribeToNotifications,
      unsubscribeFromNotifications: state.unsubscribeFromNotifications,
    }),
    shallow
  );
};

export const useUnreadNotifications = () => {
  return useAppStore((state) => state.getUnreadNotifications());
};

export const useHighPriorityNotifications = () => {
  return useAppStore((state) => state.getHighPriorityNotifications());
};

// Combined selectors
export const useDashboardData = () => {
  return useAppStore(
    (state) => ({
      activeProjects: state.getActiveProjects(),
      completedProjects: state.getCompletedProjects(),
      overdueInvoices: state.getOverdueInvoices(),
      unreadNotifications: state.unreadCount,
      profile: state.profile,
    }),
    shallow
  );
};

// Default export
export { useAppStore as useStore };