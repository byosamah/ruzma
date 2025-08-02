import { createLazyComponent, defaultFallbacks } from '@/lib/performance/lazyLoader';

/**
 * Lazy loaded route components
 */

// Authentication routes
export const Login = createLazyComponent(
  () => import('@/pages/Login'),
  { fallback: defaultFallbacks.page }
);

export const SignUp = createLazyComponent(
  () => import('@/pages/SignUp'),
  { fallback: defaultFallbacks.page }
);

export const ForgotPassword = createLazyComponent(
  () => import('@/pages/ForgotPassword'),
  { fallback: defaultFallbacks.page }
);

export const ResetPassword = createLazyComponent(
  () => import('@/pages/ResetPassword'),
  { fallback: defaultFallbacks.page }
);

// Main app routes
export const Dashboard = createLazyComponent(
  () => import('@/pages/Dashboard'),
  { fallback: defaultFallbacks.page, preload: true }
);

export const Projects = createLazyComponent(
  () => import('@/pages/Projects'),
  { fallback: defaultFallbacks.page }
);

export const CreateProject = createLazyComponent(
  () => import('@/pages/CreateProject'),
  { fallback: defaultFallbacks.page }
);

export const EditProject = createLazyComponent(
  () => import('@/pages/EditProject'),
  { fallback: defaultFallbacks.page }
);

export const ProjectManagement = createLazyComponent(
  () => import('@/pages/ProjectManagement'),
  { fallback: defaultFallbacks.page }
);

export const ProjectTemplates = createLazyComponent(
  () => import('@/pages/ProjectTemplates'),
  { fallback: defaultFallbacks.page }
);

// Client management routes
export const Clients = createLazyComponent(
  () => import('@/pages/Clients'),
  { fallback: defaultFallbacks.page }
);

export const ClientProject = createLazyComponent(
  () => import('@/pages/ClientProject'),
  { fallback: defaultFallbacks.page }
);

export const ContractApproval = createLazyComponent(
  () => import('@/pages/ContractApproval'),
  { fallback: defaultFallbacks.page }
);

// Financial routes
export const Invoices = createLazyComponent(
  () => import('@/pages/Invoices'),
  { fallback: defaultFallbacks.page }
);

export const CreateInvoice = createLazyComponent(
  () => import('@/pages/CreateInvoice'),
  { fallback: defaultFallbacks.page }
);

export const Analytics = createLazyComponent(
  () => import('@/pages/Analytics'),
  { fallback: defaultFallbacks.page }
);

// User routes
export const Profile = createLazyComponent(
  () => import('@/pages/Profile'),
  { fallback: defaultFallbacks.page }
);

export const Plans = createLazyComponent(
  () => import('@/pages/Plans'),
  { fallback: defaultFallbacks.page }
);

// Other routes
export const ContactUs = createLazyComponent(
  () => import('@/pages/ContactUs'),
  { fallback: defaultFallbacks.page }
);

export const NotFound = createLazyComponent(
  () => import('@/pages/NotFound'),
  { fallback: defaultFallbacks.page }
);

/**
 * Route configuration
 */
export const routes = {
  // Auth routes
  login: '/:lang/login',
  signup: '/:lang/signup',
  forgotPassword: '/:lang/forgot-password',
  resetPassword: '/:lang/reset-password',
  
  // Main routes
  dashboard: '/:lang/dashboard',
  projects: '/:lang/projects',
  createProject: '/:lang/create-project',
  editProject: '/:lang/edit-project/:slug',
  projectManagement: '/:lang/project/:slug',
  projectTemplates: '/:lang/templates',
  
  // Client routes
  clients: '/:lang/clients',
  clientProject: '/client/:token',
  contractApproval: '/contract/approve/:token',
  
  // Financial routes
  invoices: '/:lang/invoices',
  createInvoice: '/:lang/create-invoice',
  analytics: '/:lang/analytics',
  
  // User routes
  profile: '/:lang/profile',
  plans: '/:lang/plans',
  
  // Other routes
  contact: '/:lang/contact',
  
  // Helpers
  getPath: (route: string, params: Record<string, string> = {}) => {
    let path = route;
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
    return path;
  }
};

/**
 * Preload critical routes
 */
export const preloadCriticalRoutes = () => {
  // Preload commonly accessed routes
  Dashboard.preload?.();
  Projects.preload?.();
};