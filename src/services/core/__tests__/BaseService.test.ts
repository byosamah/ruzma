import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseService } from '../BaseService';
import { User } from '@supabase/supabase-js';
import * as authSecurity from '@/lib/authSecurity';

// Mock the authSecurity module
vi.mock('@/lib/authSecurity', () => ({
  logSecurityEvent: vi.fn(),
}));

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

// Create a concrete implementation of BaseService for testing
class TestService extends BaseService {
  // Expose protected methods for testing
  public testEnsureAuthenticated(): User {
    return this.ensureAuthenticated();
  }

  public testLogOperation(operation: string, data?: Record<string, unknown>) {
    this.logOperation(operation, data);
  }

  public async testHandleError(error: unknown, operation: string): Promise<never> {
    return this.handleError(error, operation);
  }

  public testGetSupabase() {
    return this.supabase;
  }
}

describe('BaseService', () => {
  let mockUser: User;
  let service: TestService;
  let serviceWithoutUser: TestService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock user
    mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    } as User;

    service = new TestService(mockUser);
    serviceWithoutUser = new TestService(null);
  });

  describe('constructor', () => {
    it('should initialize with a user', () => {
      expect(service['user']).toBe(mockUser);
    });

    it('should initialize with null user', () => {
      expect(serviceWithoutUser['user']).toBeNull();
    });

    it('should store the user reference correctly', () => {
      const anotherUser = { ...mockUser, id: 'different-user' } as User;
      const anotherService = new TestService(anotherUser);
      expect(anotherService['user']?.id).toBe('different-user');
    });
  });

  describe('ensureAuthenticated', () => {
    it('should return user when authenticated', () => {
      const user = service.testEnsureAuthenticated();
      expect(user).toBe(mockUser);
      expect(user.id).toBe('test-user-123');
    });

    it('should throw error when not authenticated', () => {
      expect(() => serviceWithoutUser.testEnsureAuthenticated()).toThrow('User not authenticated');
    });

    it('should throw error with exact message', () => {
      try {
        serviceWithoutUser.testEnsureAuthenticated();
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('User not authenticated');
      }
    });

    it('should return the same user instance each time', () => {
      const user1 = service.testEnsureAuthenticated();
      const user2 = service.testEnsureAuthenticated();
      expect(user1).toBe(user2);
    });
  });

  describe('logOperation', () => {
    it('should log operation with user ID when user exists', () => {
      const operation = 'test_operation';
      const data = { key: 'value', count: 42 };

      service.testLogOperation(operation, data);

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith(operation, {
        userId: 'test-user-123',
        key: 'value',
        count: 42,
      });
    });

    it('should log operation without additional data', () => {
      const operation = 'simple_operation';

      service.testLogOperation(operation);

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith(operation, {
        userId: 'test-user-123',
      });
    });

    it('should not log operation when user is null', () => {
      const operation = 'test_operation';
      const data = { key: 'value' };

      serviceWithoutUser.testLogOperation(operation, data);

      expect(authSecurity.logSecurityEvent).not.toHaveBeenCalled();
    });

    it('should handle empty data object', () => {
      service.testLogOperation('operation', {});

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith('operation', {
        userId: 'test-user-123',
      });
    });

    it('should merge data with userId correctly', () => {
      const data = {
        action: 'create',
        resourceId: 'res-123',
        timestamp: Date.now()
      };

      service.testLogOperation('resource_created', data);

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith('resource_created', {
        userId: 'test-user-123',
        action: 'create',
        resourceId: 'res-123',
        timestamp: expect.any(Number),
      });
    });

    it('should handle nested data objects', () => {
      const complexData = {
        resource: {
          type: 'project',
          id: 'proj-123',
        },
        metadata: {
          source: 'web',
        },
      };

      service.testLogOperation('complex_operation', complexData);

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith('complex_operation', {
        userId: 'test-user-123',
        resource: {
          type: 'project',
          id: 'proj-123',
        },
        metadata: {
          source: 'web',
        },
      });
    });
  });

  describe('handleError', () => {
    it('should log error operation and rethrow the error', async () => {
      const error = new Error('Test error');
      const operation = 'test_operation';

      await expect(service.testHandleError(error, operation)).rejects.toThrow('Test error');

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith('test_operation_error', {
        userId: 'test-user-123',
        error: 'Test error',
      });
    });

    it('should handle error without message property', async () => {
      const error = { code: 'ERROR_CODE' };
      const operation = 'test_operation';

      await expect(service.testHandleError(error, operation)).rejects.toEqual(error);

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith('test_operation_error', {
        userId: 'test-user-123',
        error: undefined,
      });
    });

    it('should rethrow the original error unchanged', async () => {
      const customError = new Error('Custom error message');
      customError.name = 'CustomError';

      try {
        await service.testHandleError(customError, 'operation');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBe(customError);
        expect((error as Error).name).toBe('CustomError');
        expect((error as Error).message).toBe('Custom error message');
      }
    });

    it('should log error even when user is null', async () => {
      const error = new Error('Error without user');

      await expect(serviceWithoutUser.testHandleError(error, 'operation')).rejects.toThrow();

      // logOperation is only called when user exists, so logSecurityEvent shouldn't be called
      expect(authSecurity.logSecurityEvent).not.toHaveBeenCalled();
    });

    it('should handle string errors', async () => {
      const error = 'String error';
      const operation = 'string_operation';

      await expect(service.testHandleError(error, operation)).rejects.toBe(error);
    });

    it('should handle errors with additional properties', async () => {
      const error = {
        message: 'Database error',
        code: 'PGRST301',
        details: 'Row not found',
      };

      await expect(service.testHandleError(error, 'db_operation')).rejects.toEqual(error);

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith('db_operation_error', {
        userId: 'test-user-123',
        error: 'Database error',
      });
    });
  });

  describe('supabase getter', () => {
    it('should return supabase client', () => {
      const client = service.testGetSupabase();
      expect(client).toBeDefined();
      expect(client).toHaveProperty('from');
    });

    it('should return the same supabase instance', () => {
      const client1 = service.testGetSupabase();
      const client2 = service.testGetSupabase();
      expect(client1).toBe(client2);
    });

    it('should have expected supabase methods', () => {
      const client = service.testGetSupabase();
      expect(typeof client.from).toBe('function');
    });

    it('should be accessible from service without user', () => {
      const client = serviceWithoutUser.testGetSupabase();
      expect(client).toBeDefined();
      expect(client).toHaveProperty('from');
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical service workflow', () => {
      // 1. Ensure authenticated
      const user = service.testEnsureAuthenticated();
      expect(user.id).toBe('test-user-123');

      // 2. Log operation start
      service.testLogOperation('workflow_started', { workflowId: 'wf-1' });
      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith('workflow_started', {
        userId: 'test-user-123',
        workflowId: 'wf-1',
      });

      // 3. Access supabase
      const client = service.testGetSupabase();
      expect(client).toBeDefined();

      // 4. Log operation complete
      service.testLogOperation('workflow_completed', { workflowId: 'wf-1', duration: 123 });
      expect(authSecurity.logSecurityEvent).toHaveBeenCalledTimes(2);
    });

    it('should handle error scenario in workflow', async () => {
      const user = service.testEnsureAuthenticated();
      expect(user).toBeDefined();

      service.testLogOperation('operation_started');

      const error = new Error('Operation failed');
      await expect(service.testHandleError(error, 'operation')).rejects.toThrow('Operation failed');

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith('operation_error', {
        userId: 'test-user-123',
        error: 'Operation failed',
      });
    });

    it('should reject workflow when not authenticated', () => {
      expect(() => serviceWithoutUser.testEnsureAuthenticated()).toThrow('User not authenticated');

      // No operations should be logged
      expect(authSecurity.logSecurityEvent).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle user with minimal properties', () => {
      const minimalUser = { id: 'min-123' } as User;
      const minimalService = new TestService(minimalUser);

      const user = minimalService.testEnsureAuthenticated();
      expect(user.id).toBe('min-123');
    });

    it('should handle rapid successive calls', () => {
      for (let i = 0; i < 100; i++) {
        const user = service.testEnsureAuthenticated();
        expect(user.id).toBe('test-user-123');
      }
    });

    it('should handle logging with special characters in data', () => {
      const specialData = {
        message: 'Test with "quotes" and \'apostrophes\'',
        code: '<script>alert("xss")</script>',
      };

      service.testLogOperation('special_chars', specialData);

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith('special_chars', {
        userId: 'test-user-123',
        message: 'Test with "quotes" and \'apostrophes\'',
        code: '<script>alert("xss")</script>',
      });
    });

    it('should handle very long operation names', () => {
      const longOperation = 'a'.repeat(1000);
      service.testLogOperation(longOperation);

      expect(authSecurity.logSecurityEvent).toHaveBeenCalledWith(longOperation, {
        userId: 'test-user-123',
      });
    });
  });
});
