/**
 * Main store exports - now using hybrid approach for gradual migration
 * to service-injected architecture
 */

// Use hybrid store during migration period
export * from './hybrid';

// Migration utilities
export * from './migration';

// Keep selectors available
export { hybridSelectors as selectors } from './hybrid';

// Re-export store as default
export { useStore as default } from './hybrid';