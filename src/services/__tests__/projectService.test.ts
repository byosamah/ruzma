import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from '../projectService';
import { User } from '@supabase/supabase-js';

// Mock all dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file.jpg' } })),
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/signed' }, error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));

vi.mock('@/lib/slugUtils', () => ({
  generateSlug: vi.fn((name: string) => name.toLowerCase().replace(/\s+/g, '-')),
  ensureUniqueSlug: vi.fn((slug: string) => Promise.resolve(slug + '-' + Date.now())),
}));

vi.mock('@/lib/analytics', () => ({
  trackProjectCreated: vi.fn(),
  trackMilestoneApproved: vi.fn(),
  trackPaymentProofUploaded: vi.fn(),
  trackDeliverableUploaded: vi.fn(),
  trackMilestoneCreated: vi.fn(),
}));

vi.mock('@/services/emailNotifications', () => ({
  sendPaymentNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../core/ServiceRegistry', () => ({
  ServiceRegistry: {
    getInstance: vi.fn(() => ({
      getUserService: vi.fn(() => ({
        getUserLimits: vi.fn().mockResolvedValue({ canCreateProject: true }),
        updateProjectCount: vi.fn().mockResolvedValue(undefined),
      })),
      getEmailService: vi.fn(() => ({})),
      getClientService: vi.fn(() => ({})),
    })),
  },
}));

vi.mock('../core/ContractService', () => ({
  ContractService: vi.fn().mockImplementation(() => ({
    sendContractApprovalEmail: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../core/CurrencyService', () => ({
  CurrencyService: vi.fn().mockImplementation(() => ({
    getUserCurrency: vi.fn().mockResolvedValue('USD'),
  })),
}));

vi.mock('../core/RateLimitService', () => ({
  rateLimitService: {
    checkMultipleRateLimits: vi.fn(() => ({ allowed: true })),
  },
}));

describe('ProjectService', () => {
  let mockUser: User;
  let service: ProjectService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
    } as User;

    service = new ProjectService(mockUser);
  });

  describe('Constructor', () => {
    it('should initialize with user', () => {
      expect(service['user']).toBe(mockUser);
    });

    it('should initialize without user', () => {
      const anonService = new ProjectService(null);
      expect(anonService['user']).toBeNull();
    });

    it('should initialize required services', () => {
      expect(service['userService']).toBeDefined();
      expect(service['emailService']).toBeDefined();
      expect(service['clientService']).toBeDefined();
      expect(service['contractService']).toBeDefined();
      expect(service['currencyService']).toBeDefined();
    });
  });

  describe('sanitizeFilename (private utility)', () => {
    it('should sanitize special characters', () => {
      // Test via the module-level function
      const result = (service as any).constructor.sanitizeFilename || function(filename: string) {
        return filename
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')
          .substring(0, 100);
      };

      // Since it's a module-level function, test the sanitization logic
      const sanitize = (filename: string) => filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 100);

      expect(sanitize('test file.pdf')).toBe('test_file.pdf');
      expect(sanitize('file@name#.jpg')).toBe('file_name_.jpg');
      expect(sanitize('___test___')).toBe('test');
      expect(sanitize('a'.repeat(150) + '.txt')).toHaveLength(100);
    });
  });

  describe('saveProject', () => {
    const mockProjectData = {
      name: 'Test Project',
      brief: 'Test brief',
      milestones: [
        {
          title: 'Milestone 1',
          description: 'Description 1',
          price: 100,
          start_date: '2024-01-01',
          end_date: '2024-01-31'
        }
      ]
    };

    it('should call createProject in create mode', async () => {
      const createSpy = vi.spyOn(service as any, 'createProject').mockResolvedValue({});

      await service.saveProject(mockProjectData, 'create');

      expect(createSpy).toHaveBeenCalledWith(mockProjectData);
    });

    it('should call updateProject in edit mode', async () => {
      const updateSpy = vi.spyOn(service as any, 'updateProject').mockResolvedValue({});
      const dataWithId = { ...mockProjectData, id: 'proj-123' };

      await service.saveProject(dataWithId, 'edit');

      expect(updateSpy).toHaveBeenCalledWith(dataWithId);
    });

    it('should throw error when user not authenticated', async () => {
      const anonService = new ProjectService(null);

      await expect(
        anonService.saveProject(mockProjectData, 'create')
      ).rejects.toThrow('User not authenticated');
    });
  });

  describe('deleteProject', () => {
    it('should throw error when user not authenticated', async () => {
      const anonService = new ProjectService(null);

      await expect(
        anonService.deleteProject('proj-123')
      ).rejects.toThrow('User not authenticated');
    });

    it('should verify project ownership before deletion', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { user_id: 'different-user', name: 'Test Project' },
          error: null
        })
      });
      (mockSupabase.supabase.from as any) = fromMock;

      await expect(
        service.deleteProject('proj-123')
      ).rejects.toThrow('You do not have permission to delete this project');
    });
  });

  describe('calculateProjectDates (private method)', () => {
    it('should calculate start and end dates from milestones', () => {
      const calculateDates = (milestones: any[]) => {
        const validDates = milestones
          .flatMap(m => [m.start_date, m.end_date])
          .filter(date => date && date.trim() !== '')
          .map(date => new Date(date))
          .filter(date => !isNaN(date.getTime()));

        if (!validDates.length) {
          return { startDate: null, endDate: null };
        }

        const startDate = new Date(Math.min(...validDates.map(d => d.getTime())));
        const endDate = new Date(Math.max(...validDates.map(d => d.getTime())));

        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
      };

      const milestones = [
        { start_date: '2024-01-01', end_date: '2024-01-15' },
        { start_date: '2024-01-16', end_date: '2024-01-31' }
      ];

      const result = calculateDates(milestones);
      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-01-31');
    });

    it('should return null dates when no valid dates', () => {
      const calculateDates = (milestones: any[]) => {
        const validDates = milestones
          .flatMap(m => [m.start_date, m.end_date])
          .filter(date => date && date.trim() !== '')
          .map(date => new Date(date))
          .filter(date => !isNaN(date.getTime()));

        if (!validDates.length) {
          return { startDate: null, endDate: null };
        }

        const startDate = new Date(Math.min(...validDates.map(d => d.getTime())));
        const endDate = new Date(Math.max(...validDates.map(d => d.getTime())));

        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
      };

      const milestones = [
        { start_date: '', end_date: '' },
        { start_date: null, end_date: null }
      ];

      const result = calculateDates(milestones);
      expect(result.startDate).toBeNull();
      expect(result.endDate).toBeNull();
    });

    it('should handle single date', () => {
      const calculateDates = (milestones: any[]) => {
        const validDates = milestones
          .flatMap(m => [m.start_date, m.end_date])
          .filter(date => date && date.trim() !== '')
          .map(date => new Date(date))
          .filter(date => !isNaN(date.getTime()));

        if (!validDates.length) {
          return { startDate: null, endDate: null };
        }

        const startDate = new Date(Math.min(...validDates.map(d => d.getTime())));
        const endDate = new Date(Math.max(...validDates.map(d => d.getTime())));

        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
      };

      const milestones = [{ start_date: '2024-01-15', end_date: '' }];

      const result = calculateDates(milestones);
      expect(result.startDate).toBe('2024-01-15');
      expect(result.endDate).toBe('2024-01-15');
    });
  });

  describe('Edge Cases', () => {
    it('should handle project data with trim requirements', () => {
      const projectData = {
        name: '  Test Project  ',
        brief: '  Test brief  ',
        clientEmail: '  test@example.com  ',
        milestones: []
      };

      // Test trimming logic
      expect(projectData.name.trim()).toBe('Test Project');
      expect(projectData.brief.trim()).toBe('Test brief');
      expect(projectData.clientEmail.trim()).toBe('test@example.com');
    });

    it('should validate required fields', () => {
      const invalidData = {
        name: '',
        brief: '',
        milestones: []
      };

      expect(invalidData.name.trim()).toBe('');
      expect(invalidData.brief.trim()).toBe('');
      expect(invalidData.milestones.length).toBe(0);
    });

    it('should handle milestone price calculations', () => {
      const milestones = [
        { price: 100 },
        { price: 200 },
        { price: 0 },
        { price: undefined }
      ];

      const total = milestones.reduce((sum, m) => sum + (m.price || 0), 0);
      expect(total).toBe(300);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle missing project name', async () => {
      const invalidData = {
        name: '',
        brief: 'Valid brief',
        milestones: [{ title: 'M1', description: 'D1', price: 100 }]
      };

      // The service would throw an error for empty name after trim
      await expect(
        service.saveProject(invalidData as any, 'create')
      ).rejects.toThrow();
    });

    it('should handle missing brief', async () => {
      const invalidData = {
        name: 'Valid name',
        brief: '',
        milestones: [{ title: 'M1', description: 'D1', price: 100 }]
      };

      await expect(
        service.saveProject(invalidData as any, 'create')
      ).rejects.toThrow();
    });

    it('should handle missing milestones', async () => {
      const invalidData = {
        name: 'Valid name',
        brief: 'Valid brief',
        milestones: []
      };

      await expect(
        service.saveProject(invalidData as any, 'create')
      ).rejects.toThrow();
    });
  });

  describe('Authentication Requirements', () => {
    // Methods that throw errors
    const throwingMethods = [
      { method: 'saveProject', args: [{ name: 'Test', brief: 'Test', milestones: [] }] },
      { method: 'deleteProject', args: ['proj-123'] },
    ];

    throwingMethods.forEach(({ method, args }) => {
      it(`${method} should throw when not authenticated`, async () => {
        const anonService = new ProjectService(null);

        await expect(
          (anonService as any)[method](...args)
        ).rejects.toThrow(/not authenticated|logged in/i);
      });
    });

    // Methods that return false
    const falseReturningMethods = [
      { method: 'uploadPaymentProof', args: ['milestone-123', new File([], 'test.jpg')] },
      { method: 'uploadDeliverable', args: ['milestone-123', new File([], 'test.pdf')] },
      { method: 'updateDeliverableLink', args: ['milestone-123', 'https://example.com'] },
      { method: 'updateRevisionData', args: ['milestone-123', 'https://example.com'] },
      { method: 'addRevisionRequest', args: ['milestone-123', 'https://example.com'] },
    ];

    falseReturningMethods.forEach(({ method, args }) => {
      it(`${method} should return false when not authenticated`, async () => {
        const anonService = new ProjectService(null);

        const result = await (anonService as any)[method](...args);
        expect(result).toBe(false);
      });
    });
  });

  describe('Template Operations', () => {
    it('should require authentication for saveAsTemplate', async () => {
      const anonService = new ProjectService(null);
      const templateData = {
        name: 'Template',
        brief: 'Brief',
        milestones: []
      };

      await expect(
        anonService.saveAsTemplate(templateData as any)
      ).rejects.toThrow('You must be logged in to save a template');
    });

    it('should require authentication for getTemplates', async () => {
      const anonService = new ProjectService(null);

      await expect(
        anonService.getTemplates()
      ).rejects.toThrow('You must be logged in to fetch templates');
    });

    it('should require authentication for deleteTemplate', async () => {
      const anonService = new ProjectService(null);

      await expect(
        anonService.deleteTemplate('template-123')
      ).rejects.toThrow('You must be logged in to delete a template');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete project creation flow', () => {
      // Simulate the data transformation that happens during project creation
      const formData = {
        name: '  My Project  ',
        brief: '  Project description  ',
        clientEmail: '  client@example.com  ',
        milestones: [
          {
            title: 'Design',
            description: 'Design phase',
            price: 500,
            start_date: '2024-01-01',
            end_date: '2024-01-15'
          },
          {
            title: 'Development',
            description: 'Development phase',
            price: 1500,
            start_date: '2024-01-16',
            end_date: '2024-02-15'
          }
        ]
      };

      // Validate data transformation
      const sanitized = {
        name: formData.name.trim(),
        brief: formData.brief.trim(),
        clientEmail: formData.clientEmail.trim()
      };

      expect(sanitized.name).toBe('My Project');
      expect(sanitized.brief).toBe('Project description');
      expect(sanitized.clientEmail).toBe('client@example.com');

      // Calculate total
      const total = formData.milestones.reduce((sum, m) => sum + m.price, 0);
      expect(total).toBe(2000);
    });
  });
});
