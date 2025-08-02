/**
 * Client Domain Components
 * Organized by feature area to reduce circular dependencies and improve tree shaking
 */

// Category-based exports
export * from './dialogs';
export * from './views';

// Re-export most commonly used components for convenience
export { AddClientDialog, EditClientDialog } from './dialogs';
export { ClientTable, ClientsStats } from './views';