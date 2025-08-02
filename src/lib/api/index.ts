/**
 * Centralized API exports
 */

export { BaseAPI } from './base';
export { ProjectAPI } from './projects';
export { ClientAPI } from './clients';
export { InvoiceAPI } from './invoices';
export { MilestoneAPI } from './milestones';
export { ProfileAPI } from './profiles';
export { NotificationAPI } from './notifications';

// Create singleton instances
import { ProjectAPI } from './projects';
import { ClientAPI } from './clients';
import { InvoiceAPI } from './invoices';
import { MilestoneAPI } from './milestones';
import { ProfileAPI } from './profiles';
import { NotificationAPI } from './notifications';

export const api = {
  projects: new ProjectAPI(),
  clients: new ClientAPI(),
  invoices: new InvoiceAPI(),
  milestones: new MilestoneAPI(),
  profiles: new ProfileAPI(),
  notifications: new NotificationAPI(),
};

// Type exports
export type { ProjectAPI, ClientAPI, InvoiceAPI, MilestoneAPI, ProfileAPI, NotificationAPI };