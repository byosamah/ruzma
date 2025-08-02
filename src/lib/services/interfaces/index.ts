// Service interfaces
export * from './IAuthService';
export * from './IProjectService';
export * from './IClientService';
export * from './IInvoiceService';
export * from './INotificationService';

// Re-export commonly used types
export type {
  AuthResult,
  SignUpData,
  UpdateProfileData,
} from './IAuthService';

export type {
  ProjectFilters,
  ProjectListOptions,
  ProjectResult,
  ProjectListResult,
} from './IProjectService';

export type {
  ClientFilters,
  ClientListOptions,
  ClientResult,
  ClientListResult,
} from './IClientService';

export type {
  InvoiceFilters,
  InvoiceListOptions,
  InvoiceResult,
  InvoiceListResult,
  InvoiceStatistics,
} from './IInvoiceService';

export type {
  NotificationFilters,
  NotificationListOptions,
  NotificationResult,
  NotificationListResult,
  NotificationSubscriptionCallbacks,
} from './INotificationService';