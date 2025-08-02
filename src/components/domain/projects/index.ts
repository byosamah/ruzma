/**
 * Project Domain Components
 * Organized by feature area to reduce circular dependencies and improve tree shaking
 */

// Category-based exports
export * from './cards';
export * from './management';
export * from './forms';

// Re-export most commonly used components for convenience
export { ProjectCard, StandardProjectCard } from './cards';
export { ProjectHeader, ProjectStats } from './management';
export { ProjectDetailsForm, MilestonesList } from './forms';