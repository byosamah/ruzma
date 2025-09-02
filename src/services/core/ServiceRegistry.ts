import { User } from '@supabase/supabase-js';
import { UserService } from './UserService';
import { EmailService } from './EmailService';
import { ClientService } from './ClientService';
import { CurrencyService } from './CurrencyService';
import { ProjectService } from '../projectService';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, unknown> = new Map();

  private constructor() {}

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  getUserService(user: User | null): UserService {
    const key = `userService_${user?.id || 'anonymous'}`;
    if (!this.services.has(key)) {
      this.services.set(key, new UserService(user));
    }
    return this.services.get(key) as UserService;
  }

  getEmailService(user: User | null): EmailService {
    const key = `emailService_${user?.id || 'anonymous'}`;
    if (!this.services.has(key)) {
      this.services.set(key, new EmailService(user));
    }
    return this.services.get(key) as EmailService;
  }

  getClientService(user: User | null): ClientService {
    const key = `clientService_${user?.id || 'anonymous'}`;
    if (!this.services.has(key)) {
      this.services.set(key, new ClientService(user));
    }
    return this.services.get(key) as ClientService;
  }

  getCurrencyService(user: User | null): CurrencyService {
    const key = `currencyService_${user?.id || 'anonymous'}`;
    if (!this.services.has(key)) {
      this.services.set(key, new CurrencyService(user));
    }
    return this.services.get(key) as CurrencyService;
  }

  getProjectService(user: User | null): ProjectService {
    const key = `projectService_${user?.id || 'anonymous'}`;
    if (!this.services.has(key)) {
      this.services.set(key, new ProjectService(user));
    }
    return this.services.get(key) as ProjectService;
  }

  clearUserServices(userId: string): void {
    const keys = Array.from(this.services.keys()).filter(key => key.includes(userId));
    keys.forEach(key => this.services.delete(key));
  }

  clearAllServices(): void {
    this.services.clear();
  }
}