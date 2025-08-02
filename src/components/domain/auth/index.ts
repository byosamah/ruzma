/**
 * Auth Domain Components
 * Organized by feature area to reduce circular dependencies and improve tree shaking
 */

// Category-based exports
export * from './forms';
export * from './layout';

// Re-export most commonly used components for convenience
export { LoginForm, SignUpContainer } from './forms';
export { LoginHeader, LoginFooter } from './layout';