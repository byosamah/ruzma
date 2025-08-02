import { SupabaseClient } from '@supabase/supabase-js';
import {
  IAuthService,
  IProjectService,
  IClientService,
  IInvoiceService,
  INotificationService,
} from './interfaces';
import { SupabaseAuthService } from './implementations/SupabaseAuthService';
import { SupabaseProjectService } from './implementations/SupabaseProjectService';

/**
 * Service container for dependency injection
 * Manages service instances and their dependencies
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();
  private supabaseClient: SupabaseClient;

  private constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
    this.initializeServices();
  }

  /**
   * Initialize the service container with Supabase client
   */
  static initialize(supabaseClient: SupabaseClient): void {
    if (ServiceContainer.instance) {
      console.warn('ServiceContainer already initialized');
      return;
    }
    ServiceContainer.instance = new ServiceContainer(supabaseClient);
  }

  /**
   * Get the service container instance
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      throw new Error('ServiceContainer not initialized. Call ServiceContainer.initialize() first.');
    }
    return ServiceContainer.instance;
  }

  /**
   * Initialize all services with their dependencies
   */
  private initializeServices(): void {
    // Initialize auth service
    this.services.set('authService', new SupabaseAuthService(this.supabaseClient));
    
    // Initialize project service
    this.services.set('projectService', new SupabaseProjectService(this.supabaseClient));
    
    // TODO: Initialize other services as they're implemented
    // this.services.set('clientService', new SupabaseClientService(this.supabaseClient));
    // this.services.set('invoiceService', new SupabaseInvoiceService(this.supabaseClient));
    // this.services.set('notificationService', new SupabaseNotificationService(this.supabaseClient));
  }

  /**
   * Get a service by interface
   */
  getAuthService(): IAuthService {
    return this.getService<IAuthService>('authService');
  }

  getProjectService(): IProjectService {
    return this.getService<IProjectService>('projectService');
  }

  getClientService(): IClientService {
    return this.getService<IClientService>('clientService');
  }

  getInvoiceService(): IInvoiceService {
    return this.getService<IInvoiceService>('invoiceService');
  }

  getNotificationService(): INotificationService {
    return this.getService<INotificationService>('notificationService');
  }

  /**
   * Generic service getter
   */
  private getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found. Make sure it's properly initialized.`);
    }
    return service;
  }

  /**
   * Register a custom service (for testing or custom implementations)
   */
  registerService<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Get all services (for debugging)
   */
  getAllServices(): Map<string, any> {
    return new Map(this.services);
  }

  /**
   * Reset the container (mainly for testing)
   */
  static reset(): void {
    ServiceContainer.instance = undefined as any;
  }
}

/**
 * Convenience functions for getting services
 */
export const getAuthService = (): IAuthService => {
  return ServiceContainer.getInstance().getAuthService();
};

export const getProjectService = (): IProjectService => {
  return ServiceContainer.getInstance().getProjectService();
};

export const getClientService = (): IClientService => {
  return ServiceContainer.getInstance().getClientService();
};

export const getInvoiceService = (): IInvoiceService => {
  return ServiceContainer.getInstance().getInvoiceService();
};

export const getNotificationService = (): INotificationService => {
  return ServiceContainer.getInstance().getNotificationService();
};