// Service interfaces
export * from './interfaces';

// Service implementations
export * from './implementations/SupabaseAuthService';
export * from './implementations/SupabaseProjectService';

// Service container
export * from './ServiceContainer';

// Convenience exports
export {
  getAuthService,
  getProjectService,
  getClientService,
  getInvoiceService,
  getNotificationService,
} from './ServiceContainer';