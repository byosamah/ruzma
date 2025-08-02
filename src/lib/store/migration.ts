/**
 * Migration strategy for gradually replacing the old store with the new service-injected store
 * This allows for gradual rollout and easy rollback if issues arise
 */

// Feature flags for gradual migration
export const STORE_MIGRATION_FLAGS = {
  USE_NEW_AUTH_SLICE: true, // Start with auth slice as it's lowest risk
  USE_NEW_PROJECT_SLICE: false, // Will enable after auth is stable
  USE_NEW_CLIENT_SLICE: false,
  USE_NEW_INVOICE_SLICE: false,
  USE_NEW_NOTIFICATION_SLICE: false,
} as const;

// Environment-based overrides (for testing)
const getEnvFlag = (flagName: string): boolean => {
  const envValue = import.meta.env[`VITE_${flagName}`];
  return envValue === 'true';
};

// Apply environment overrides
export const getMigrationFlags = () => ({
  USE_NEW_AUTH_SLICE: getEnvFlag('USE_NEW_AUTH_SLICE') || STORE_MIGRATION_FLAGS.USE_NEW_AUTH_SLICE,
  USE_NEW_PROJECT_SLICE: getEnvFlag('USE_NEW_PROJECT_SLICE') || STORE_MIGRATION_FLAGS.USE_NEW_PROJECT_SLICE,
  USE_NEW_CLIENT_SLICE: getEnvFlag('USE_NEW_CLIENT_SLICE') || STORE_MIGRATION_FLAGS.USE_NEW_CLIENT_SLICE,
  USE_NEW_INVOICE_SLICE: getEnvFlag('USE_NEW_INVOICE_SLICE') || STORE_MIGRATION_FLAGS.USE_NEW_INVOICE_SLICE,
  USE_NEW_NOTIFICATION_SLICE: getEnvFlag('USE_NEW_NOTIFICATION_SLICE') || STORE_MIGRATION_FLAGS.USE_NEW_NOTIFICATION_SLICE,
});

/**
 * Migration status tracking
 */
export const getMigrationStatus = () => {
  const flags = getMigrationFlags();
  const total = Object.keys(flags).length;
  const enabled = Object.values(flags).filter(Boolean).length;
  
  return {
    total,
    enabled,
    percentage: Math.round((enabled / total) * 100),
    isComplete: enabled === total,
    current: Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key),
    pending: Object.entries(flags)
      .filter(([_, enabled]) => !enabled)
      .map(([key, _]) => key),
  };
};

/**
 * Logging utility for migration tracking
 */
export const logMigrationStatus = () => {
  const status = getMigrationStatus();
  console.group('🔄 Store Migration Status');
  console.log(`Progress: ${status.percentage}% (${status.enabled}/${status.total})`);
  console.log('✅ Enabled:', status.current);
  console.log('⏳ Pending:', status.pending);
  
  if (status.isComplete) {
    console.log('🎉 Migration complete! All slices using service injection.');
  }
  
  console.groupEnd();
};

/**
 * Development helper to monitor migration
 */
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).__STORE_MIGRATION_STATUS__ = getMigrationStatus;
  logMigrationStatus();
}