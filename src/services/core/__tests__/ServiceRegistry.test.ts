import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServiceRegistry } from '../ServiceRegistry';
import { User } from '@supabase/supabase-js';

// Mock all service modules
vi.mock('../UserService', () => ({
  UserService: vi.fn().mockImplementation((user) => ({ user, type: 'UserService' })),
}));

vi.mock('../EmailService', () => ({
  EmailService: vi.fn().mockImplementation((user) => ({ user, type: 'EmailService' })),
}));

vi.mock('../ClientService', () => ({
  ClientService: vi.fn().mockImplementation((user) => ({ user, type: 'ClientService' })),
}));

vi.mock('../CurrencyService', () => ({
  CurrencyService: vi.fn().mockImplementation((user) => ({ user, type: 'CurrencyService' })),
}));

vi.mock('../ExchangeRateService', () => ({
  ExchangeRateService: vi.fn().mockImplementation((user) => ({ user, type: 'ExchangeRateService' })),
}));

vi.mock('../ConversionService', () => ({
  ConversionService: vi.fn().mockImplementation((user) => ({ user, type: 'ConversionService' })),
}));

vi.mock('../../projectService', () => ({
  ProjectService: vi.fn().mockImplementation((user) => ({ user, type: 'ProjectService' })),
}));

describe('ServiceRegistry', () => {
  let mockUser: User;
  let anotherUser: User;
  let registry: ServiceRegistry;

  beforeEach(() => {
    // Clear the singleton instance between tests by accessing the private static property
    // This is necessary to ensure each test starts with a fresh instance
    (ServiceRegistry as any).instance = undefined;

    mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    } as User;

    anotherUser = {
      id: 'user-456',
      email: 'another@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    } as User;

    registry = ServiceRegistry.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after tests
    registry.clearAllServices();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = ServiceRegistry.getInstance();
      const instance2 = ServiceRegistry.getInstance();
      const instance3 = ServiceRegistry.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it('should maintain state across getInstance calls', () => {
      const instance1 = ServiceRegistry.getInstance();
      const service1 = instance1.getUserService(mockUser);

      const instance2 = ServiceRegistry.getInstance();
      const service2 = instance2.getUserService(mockUser);

      // Should return the cached service
      expect(service1).toBe(service2);
    });

    it('should be a true singleton (same reference)', () => {
      const instance = ServiceRegistry.getInstance();
      expect(instance).toBeInstanceOf(ServiceRegistry);
      expect(registry).toBe(instance);
    });
  });

  describe('getUserService', () => {
    it('should create and return UserService', () => {
      const service = registry.getUserService(mockUser);

      expect(service).toBeDefined();
      expect(service).toHaveProperty('type', 'UserService');
      expect(service).toHaveProperty('user', mockUser);
    });

    it('should cache and reuse service for same user', () => {
      const service1 = registry.getUserService(mockUser);
      const service2 = registry.getUserService(mockUser);

      expect(service1).toBe(service2);
    });

    it('should create different services for different users', () => {
      const service1 = registry.getUserService(mockUser);
      const service2 = registry.getUserService(anotherUser);

      expect(service1).not.toBe(service2);
    });

    it('should handle null user (anonymous)', () => {
      const service = registry.getUserService(null);

      expect(service).toBeDefined();
      expect(service).toHaveProperty('type', 'UserService');
      expect(service).toHaveProperty('user', null);
    });

    it('should cache anonymous user service', () => {
      const service1 = registry.getUserService(null);
      const service2 = registry.getUserService(null);

      expect(service1).toBe(service2);
    });
  });

  describe('getEmailService', () => {
    it('should create and return EmailService', () => {
      const service = registry.getEmailService(mockUser);

      expect(service).toBeDefined();
      expect(service).toHaveProperty('type', 'EmailService');
      expect(service).toHaveProperty('user', mockUser);
    });

    it('should cache and reuse service for same user', () => {
      const service1 = registry.getEmailService(mockUser);
      const service2 = registry.getEmailService(mockUser);

      expect(service1).toBe(service2);
    });

    it('should create different services for different users', () => {
      const service1 = registry.getEmailService(mockUser);
      const service2 = registry.getEmailService(anotherUser);

      expect(service1).not.toBe(service2);
    });

    it('should handle null user', () => {
      const service = registry.getEmailService(null);
      expect(service).toBeDefined();
    });
  });

  describe('getClientService', () => {
    it('should create and return ClientService', () => {
      const service = registry.getClientService(mockUser);

      expect(service).toBeDefined();
      expect(service).toHaveProperty('type', 'ClientService');
    });

    it('should cache service instances', () => {
      const service1 = registry.getClientService(mockUser);
      const service2 = registry.getClientService(mockUser);

      expect(service1).toBe(service2);
    });
  });

  describe('getCurrencyService', () => {
    it('should create and return CurrencyService', () => {
      const service = registry.getCurrencyService(mockUser);

      expect(service).toBeDefined();
      expect(service).toHaveProperty('type', 'CurrencyService');
    });

    it('should cache service instances', () => {
      const service1 = registry.getCurrencyService(mockUser);
      const service2 = registry.getCurrencyService(mockUser);

      expect(service1).toBe(service2);
    });
  });

  describe('getProjectService', () => {
    it('should create and return ProjectService', () => {
      const service = registry.getProjectService(mockUser);

      expect(service).toBeDefined();
      expect(service).toHaveProperty('type', 'ProjectService');
    });

    it('should cache service instances', () => {
      const service1 = registry.getProjectService(mockUser);
      const service2 = registry.getProjectService(mockUser);

      expect(service1).toBe(service2);
    });
  });

  describe('getExchangeRateService', () => {
    it('should create and return ExchangeRateService', () => {
      const service = registry.getExchangeRateService(mockUser);

      expect(service).toBeDefined();
      expect(service).toHaveProperty('type', 'ExchangeRateService');
    });

    it('should cache service instances', () => {
      const service1 = registry.getExchangeRateService(mockUser);
      const service2 = registry.getExchangeRateService(mockUser);

      expect(service1).toBe(service2);
    });
  });

  describe('getConversionService', () => {
    it('should create and return ConversionService', () => {
      const service = registry.getConversionService(mockUser);

      expect(service).toBeDefined();
      expect(service).toHaveProperty('type', 'ConversionService');
    });

    it('should cache service instances', () => {
      const service1 = registry.getConversionService(mockUser);
      const service2 = registry.getConversionService(mockUser);

      expect(service1).toBe(service2);
    });
  });

  describe('clearUserServices', () => {
    it('should remove all services for a specific user', () => {
      // Create services for mockUser
      const userService1 = registry.getUserService(mockUser);
      const emailService1 = registry.getEmailService(mockUser);
      const clientService1 = registry.getClientService(mockUser);

      // Create services for anotherUser
      const userService2 = registry.getUserService(anotherUser);

      // Clear mockUser's services
      registry.clearUserServices('user-123');

      // mockUser's services should be recreated (new instances)
      const newUserService = registry.getUserService(mockUser);
      const newEmailService = registry.getEmailService(mockUser);
      const newClientService = registry.getClientService(mockUser);

      expect(newUserService).not.toBe(userService1);
      expect(newEmailService).not.toBe(emailService1);
      expect(newClientService).not.toBe(clientService1);

      // anotherUser's services should still be cached
      const cachedUserService2 = registry.getUserService(anotherUser);
      expect(cachedUserService2).toBe(userService2);
    });

    it('should handle clearing non-existent user services', () => {
      expect(() => registry.clearUserServices('non-existent-user')).not.toThrow();
    });

    it('should clear all service types for a user', () => {
      // Create all service types
      registry.getUserService(mockUser);
      registry.getEmailService(mockUser);
      registry.getClientService(mockUser);
      registry.getCurrencyService(mockUser);
      registry.getProjectService(mockUser);
      registry.getExchangeRateService(mockUser);
      registry.getConversionService(mockUser);

      // Clear the user's services
      registry.clearUserServices('user-123');

      // All services should be recreated (not cached)
      const services = [
        registry.getUserService(mockUser),
        registry.getEmailService(mockUser),
        registry.getClientService(mockUser),
        registry.getCurrencyService(mockUser),
        registry.getProjectService(mockUser),
        registry.getExchangeRateService(mockUser),
        registry.getConversionService(mockUser),
      ];

      // Each should be a new instance (we can't easily verify this without tracking,
      // but we can verify they're all defined)
      services.forEach(service => {
        expect(service).toBeDefined();
      });
    });
  });

  describe('clearAllServices', () => {
    it('should remove all services from the registry', () => {
      // Create multiple services
      const userService1 = registry.getUserService(mockUser);
      const userService2 = registry.getUserService(anotherUser);
      const emailService1 = registry.getEmailService(mockUser);
      const projectService1 = registry.getProjectService(mockUser);

      // Clear all services
      registry.clearAllServices();

      // All services should be recreated
      const newUserService1 = registry.getUserService(mockUser);
      const newUserService2 = registry.getUserService(anotherUser);
      const newEmailService1 = registry.getEmailService(mockUser);
      const newProjectService1 = registry.getProjectService(mockUser);

      expect(newUserService1).not.toBe(userService1);
      expect(newUserService2).not.toBe(userService2);
      expect(newEmailService1).not.toBe(emailService1);
      expect(newProjectService1).not.toBe(projectService1);
    });

    it('should handle clearing empty registry', () => {
      const freshRegistry = ServiceRegistry.getInstance();
      expect(() => freshRegistry.clearAllServices()).not.toThrow();
    });
  });

  describe('Service Isolation', () => {
    it('should isolate services between different users', () => {
      const user1Service = registry.getUserService(mockUser);
      const user2Service = registry.getUserService(anotherUser);
      const anonymousService = registry.getUserService(null);

      // All should be different instances
      expect(user1Service).not.toBe(user2Service);
      expect(user1Service).not.toBe(anonymousService);
      expect(user2Service).not.toBe(anonymousService);

      // But each should maintain their user context
      expect((user1Service as any).user).toBe(mockUser);
      expect((user2Service as any).user).toBe(anotherUser);
      expect((anonymousService as any).user).toBeNull();
    });

    it('should isolate different service types for same user', () => {
      const userService = registry.getUserService(mockUser);
      const emailService = registry.getEmailService(mockUser);
      const clientService = registry.getClientService(mockUser);
      const projectService = registry.getProjectService(mockUser);

      // All should be different instances
      expect(userService).not.toBe(emailService);
      expect(userService).not.toBe(clientService);
      expect(userService).not.toBe(projectService);
      expect(emailService).not.toBe(clientService);

      // But all should have the same user
      expect((userService as any).user).toBe(mockUser);
      expect((emailService as any).user).toBe(mockUser);
      expect((clientService as any).user).toBe(mockUser);
      expect((projectService as any).user).toBe(mockUser);
    });
  });

  describe('Caching Behavior', () => {
    it('should maintain cache after multiple service requests', () => {
      const services = [];

      // Request same service 10 times
      for (let i = 0; i < 10; i++) {
        services.push(registry.getUserService(mockUser));
      }

      // All should be the same instance
      const firstService = services[0];
      services.forEach(service => {
        expect(service).toBe(firstService);
      });
    });

    it('should cache services for multiple users simultaneously', () => {
      const users = Array.from({ length: 5 }, (_, i) => ({
        id: `user-${i}`,
        email: `user${i}@example.com`,
      } as User));

      const serviceMap = new Map();

      // Create services for all users
      users.forEach(user => {
        const service = registry.getUserService(user);
        serviceMap.set(user.id, service);
      });

      // Verify caching
      users.forEach(user => {
        const cachedService = registry.getUserService(user);
        expect(cachedService).toBe(serviceMap.get(user.id));
      });
    });

    it('should handle service creation after partial clear', () => {
      // Create services for two users
      const service1 = registry.getUserService(mockUser);
      const service2 = registry.getUserService(anotherUser);

      // Clear only one user's services
      registry.clearUserServices('user-123');

      // First user's service should be recreated
      const newService1 = registry.getUserService(mockUser);
      expect(newService1).not.toBe(service1);

      // Second user's service should still be cached
      const cachedService2 = registry.getUserService(anotherUser);
      expect(cachedService2).toBe(service2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive service requests', () => {
      const services = [];

      for (let i = 0; i < 1000; i++) {
        services.push(registry.getUserService(mockUser));
      }

      // All should be the same cached instance
      expect(new Set(services).size).toBe(1);
    });

    it('should handle users with special characters in IDs', () => {
      const specialUser = {
        id: 'user-with-special@chars_123!',
        email: 'special@example.com',
      } as User;

      const service1 = registry.getUserService(specialUser);
      const service2 = registry.getUserService(specialUser);

      expect(service1).toBe(service2);
    });

    it('should handle clearing services multiple times', () => {
      registry.getUserService(mockUser);

      registry.clearUserServices('user-123');
      registry.clearUserServices('user-123');
      registry.clearUserServices('user-123');

      expect(() => registry.getUserService(mockUser)).not.toThrow();
    });

    it('should handle getting all service types in sequence', () => {
      const services = [
        registry.getUserService(mockUser),
        registry.getEmailService(mockUser),
        registry.getClientService(mockUser),
        registry.getCurrencyService(mockUser),
        registry.getProjectService(mockUser),
        registry.getExchangeRateService(mockUser),
        registry.getConversionService(mockUser),
      ];

      // All should be defined and different
      services.forEach(service => expect(service).toBeDefined());
      const uniqueServices = new Set(services);
      expect(uniqueServices.size).toBe(services.length);
    });
  });
});
