
/**
 * Invoice Domain Components
 * Organized by feature area to reduce circular dependencies and improve tree shaking
 */

// Category-based exports
export * from './views';
export * from './forms';

// Re-export most commonly used components for convenience
export { InvoiceTable, InvoicesStats } from './views';
export { InvoiceForm, InvoicePreview } from './forms';
