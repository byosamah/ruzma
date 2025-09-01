# Ruzma State Management Architecture

## Overview
Ruzma employs a sophisticated state management strategy that combines React Context for global application state, TanStack Query for server state management, and a service-oriented architecture for business logic encapsulation.

## State Architecture Layers

### 1. Server State (TanStack Query)
Manages all data fetching, caching, and synchronization with the backend.

### 2. Global Client State (React Context)
Handles authentication, language preferences, and cross-component state.

### 3. Local Component State (useState/useReducer)
Component-specific state that doesn't need to be shared.

### 4. Business Logic Layer (Services)
Encapsulates complex business operations and data transformations.

## React Context Providers

### Authentication Context
Manages user authentication state and authentication actions.

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authChecked: boolean;
}

interface AuthActions {
  signUp: (formData: SignUpFormData) => Promise<AuthResult>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

interface AuthContextType extends AuthState, AuthActions {}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logSecurityEvent('auth_session_error', { error: error.message });
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          logSecurityEvent('auth_session_restored', { userId: session.user.id });
        }
      } catch (error) {
        logSecurityEvent('auth_session_exception', { error: String(error) });
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setAuthChecked(true);
        
        // Log auth events for security monitoring
        if (event === 'SIGNED_IN' && session?.user) {
          logSecurityEvent('auth_signin', { userId: session.user.id });
        } else if (event === 'SIGNED_OUT') {
          logSecurityEvent('auth_signout', { userId: user?.id });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Authentication actions
  const signUp = async (formData: SignUpFormData): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            currency: formData.currency,
            country: formData.country,
          }
        }
      });

      logSecurityEvent('auth_signup_attempt', { 
        email: formData.email,
        success: !error 
      });

      if (error) throw error;

      return {
        success: true,
        needsConfirmation: !data.user?.email_confirmed_at
      };
    } catch (error) {
      logSecurityEvent('auth_signup_error', { error: String(error) });
      throw new AppError('Registration failed', 'SIGNUP_ERROR');
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Handle remember me functionality
      if (rememberMe && data.session) {
        localStorage.setItem('rememberMe', 'true');
      }

      logSecurityEvent('auth_signin_success', { 
        userId: data.user?.id,
        rememberMe 
      });
    } catch (error) {
      logSecurityEvent('auth_signin_failed', { email, error: String(error) });
      throw new AppError('Login failed', 'SIGNIN_ERROR');
    }
  };

  const signOut = async () => {
    try {
      const userId = user?.id;
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      localStorage.removeItem('rememberMe');
      logSecurityEvent('auth_signout_success', { userId });
    } catch (error) {
      logSecurityEvent('auth_signout_error', { error: String(error) });
      throw new AppError('Logout failed', 'SIGNOUT_ERROR');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authChecked,
        signUp,
        signIn,
        signOut,
        resendConfirmation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### Language Context
Manages multi-language state and localization.

```typescript
interface LanguageState {
  currentLanguage: string;
  supportedLanguages: string[];
  translations: Record<string, string>;
  isLoading: boolean;
}

interface LanguageActions {
  setLanguage: (language: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const supportedLanguages = ['en', 'es', 'fr', 'de', 'ar'];

  // Load translations based on current language
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const translationsModule = await import(`@/translations/${currentLanguage}.json`);
        setTranslations(translationsModule.default);
      } catch (error) {
        console.warn(`Failed to load translations for ${currentLanguage}, falling back to English`);
        const fallbackModule = await import('@/translations/en.json');
        setTranslations(fallbackModule.default);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // Translation function with parameter interpolation
  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), value);
      });
    }
    
    return translation;
  };

  const setLanguage = (language: string) => {
    if (supportedLanguages.includes(language)) {
      setCurrentLanguage(language);
      localStorage.setItem('preferredLanguage', language);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        supportedLanguages,
        translations,
        isLoading,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
```

### Invoice Context
Manages invoice creation and editing state.

```typescript
interface InvoiceState {
  currentInvoice: Invoice | null;
  invoiceItems: InvoiceItem[];
  isEditing: boolean;
  isDraft: boolean;
}

interface InvoiceActions {
  createInvoice: (projectId?: string) => void;
  updateInvoice: (updates: Partial<Invoice>) => void;
  addInvoiceItem: (item: Omit<InvoiceItem, 'id'>) => void;
  removeInvoiceItem: (itemId: string) => void;
  updateInvoiceItem: (itemId: string, updates: Partial<InvoiceItem>) => void;
  calculateTotals: () => InvoiceTotals;
  saveInvoice: () => Promise<void>;
  generatePDF: () => Promise<string>;
  resetInvoice: () => void;
}

export const InvoiceProvider = ({ children }: InvoiceProviderProps) => {
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDraft, setIsDraft] = useState(true);

  // Auto-calculate totals when items change
  useEffect(() => {
    if (currentInvoice) {
      const totals = calculateTotals();
      setCurrentInvoice(prev => prev ? { ...prev, ...totals } : null);
    }
  }, [invoiceItems]);

  const createInvoice = (projectId?: string) => {
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      currency: 'USD',
      projectId,
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      taxRate: 0,
      paymentTerms: 'Net 30',
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCurrentInvoice(newInvoice);
    setInvoiceItems([]);
    setIsEditing(true);
    setIsDraft(true);
  };

  const addInvoiceItem = (item: Omit<InvoiceItem, 'id'>) => {
    const newItem: InvoiceItem = {
      ...item,
      id: crypto.randomUUID(),
      totalPrice: item.quantity * item.unitPrice,
    };

    setInvoiceItems(prev => [...prev, newItem]);
  };

  const updateInvoiceItem = (itemId: string, updates: Partial<InvoiceItem>) => {
    setInvoiceItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, ...updates };
        updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = (): InvoiceTotals => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = currentInvoice?.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return { subtotal, taxAmount, totalAmount };
  };

  const saveInvoice = async () => {
    if (!currentInvoice) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .upsert({
          ...currentInvoice,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Save invoice items
      await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', currentInvoice.id);

      if (invoiceItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            invoiceItems.map(item => ({
              ...item,
              invoice_id: currentInvoice.id,
            }))
          );

        if (itemsError) throw itemsError;
      }

      setIsDraft(false);
      toast.success('Invoice saved successfully');
    } catch (error) {
      toast.error('Failed to save invoice');
      throw error;
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        currentInvoice,
        invoiceItems,
        isEditing,
        isDraft,
        createInvoice,
        updateInvoice: setCurrentInvoice,
        addInvoiceItem,
        removeInvoiceItem,
        updateInvoiceItem,
        calculateTotals,
        saveInvoice,
        generatePDF,
        resetInvoice: () => {
          setCurrentInvoice(null);
          setInvoiceItems([]);
          setIsEditing(false);
          setIsDraft(true);
        },
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};
```

## TanStack Query Integration

### Query Client Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,      // 10 minutes
      gcTime: 30 * 60 * 1000,         // 30 minutes (formerly cacheTime)
      retry: 1,                        // Retry failed requests once
      refetchOnWindowFocus: false,     // Don't refetch when window regains focus
      refetchOnReconnect: false,       // Don't refetch when reconnecting
      refetchOnMount: false,           // Don't refetch when component mounts
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        // Global error handling
        if (error?.message !== 'User cancelled operation') {
          toast.error(error?.message || 'An error occurred');
        }
      },
    },
  },
});
```

### Custom Query Hooks

#### Dashboard Data Query
```typescript
export const useDashboardDataQuery = (user: User | null) => {
  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const [profileResult, projectsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        
        supabase
          .from('projects')
          .select(`
            *,
            client:clients(*),
            milestones(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (profileResult.error) throw profileResult.error;
      if (projectsResult.error) throw projectsResult.error;

      return {
        profile: profileResult.data,
        projects: projectsResult.data || [],
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

#### Projects Query
```typescript
export const useProjectsQuery = (user: User | null) => {
  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(name, email, company),
          milestones!inner(
            id, title, status, price,
            deliverable_link, payment_proof_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};
```

#### Clients Query with Infinite Scroll
```typescript
export const useClientsInfiniteQuery = (user: User | null, searchTerm?: string) => {
  return useInfiniteQuery({
    queryKey: ['clients', user?.id, searchTerm],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        clients: data || [],
        nextPage: data && data.length === 20 ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user,
    initialPageParam: 0,
  });
};
```

### Mutation Hooks

#### Project Mutations
```typescript
export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Optimistically add to cache
      queryClient.setQueryData(['project', data.id], data);
      
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
};

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['project', id] });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData(['project', id]);

      // Optimistically update
      queryClient.setQueryData(['project', id], (old: any) => ({
        ...old,
        ...updates,
        updated_at: new Date().toISOString(),
      }));

      return { previousProject };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(['project', variables.id], context.previousProject);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
```

## Service-Oriented Architecture

### ServiceRegistry Pattern
Centralized service management with dependency injection.

```typescript
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any> = new Map();

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
    return this.services.get(key);
  }

  getProjectService(user: User | null): ProjectService {
    const key = `projectService_${user?.id || 'anonymous'}`;
    if (!this.services.has(key)) {
      this.services.set(key, new ProjectService(user));
    }
    return this.services.get(key);
  }

  getClientService(user: User | null): ClientService {
    const key = `clientService_${user?.id || 'anonymous'}`;
    if (!this.services.has(key)) {
      this.services.set(key, new ClientService(user));
    }
    return this.services.get(key);
  }

  // Clear services when user logs out
  clearUserServices(userId: string): void {
    const keys = Array.from(this.services.keys()).filter(key => key.includes(userId));
    keys.forEach(key => this.services.delete(key));
  }
}
```

### Base Service Class
```typescript
export abstract class BaseService {
  protected user: User | null;
  protected supabase = supabase;

  constructor(user: User | null) {
    this.user = user;
  }

  protected requireAuth(): User {
    if (!this.user) {
      throw new AppError('Authentication required', 'AUTH_REQUIRED');
    }
    return this.user;
  }

  protected async handleDatabaseError(error: any, operation: string): Promise<never> {
    console.error(`Database error in ${operation}:`, error);
    
    // Log security event for database errors
    logSecurityEvent('database_error', {
      operation,
      error: error.message,
      userId: this.user?.id,
    });

    if (error.code === 'PGRST301') {
      throw new AppError('Access denied', 'ACCESS_DENIED');
    } else if (error.code === '23505') {
      throw new AppError('Duplicate entry', 'DUPLICATE_ENTRY');
    } else {
      throw new AppError(`Failed to ${operation}`, 'DATABASE_ERROR');
    }
  }
}
```

### Project Service Implementation
```typescript
export class ProjectService extends BaseService {
  async createProject(projectData: CreateProjectData): Promise<Project> {
    const user = this.requireAuth();

    try {
      // Generate unique slug
      const slug = this.generateUniqueSlug(projectData.name);

      const { data, error } = await this.supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
          slug,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial milestones if provided
      if (projectData.milestones?.length > 0) {
        await this.createMilestones(data.id, projectData.milestones);
      }

      logSecurityEvent('project_created', {
        userId: user.id,
        projectId: data.id,
        projectName: data.name,
      });

      return data;
    } catch (error) {
      await this.handleDatabaseError(error, 'create project');
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const user = this.requireAuth();

    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user owns the project
        .select()
        .single();

      if (error) throw error;

      logSecurityEvent('project_updated', {
        userId: user.id,
        projectId: id,
        updatedFields: Object.keys(updates),
      });

      return data;
    } catch (error) {
      await this.handleDatabaseError(error, 'update project');
    }
  }

  async deleteProject(id: string): Promise<void> {
    const user = this.requireAuth();

    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      logSecurityEvent('project_deleted', {
        userId: user.id,
        projectId: id,
      });
    } catch (error) {
      await this.handleDatabaseError(error, 'delete project');
    }
  }

  private generateUniqueSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    return `${baseSlug}-${Date.now()}`;
  }

  private async createMilestones(projectId: string, milestones: CreateMilestoneData[]): Promise<void> {
    const milestonesWithProjectId = milestones.map((milestone, index) => ({
      ...milestone,
      project_id: projectId,
      order_index: index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await this.supabase
      .from('milestones')
      .insert(milestonesWithProjectId);

    if (error) throw error;
  }
}
```

## Custom Hooks for Business Logic

### Dashboard Hook
```typescript
export const useDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading: dataLoading, refetch } = useDashboardDataQuery(user);
  const userCurrency = useUserCurrency(data?.profile);
  const stats = useDashboardStats(data?.projects || []);

  const projectService = ServiceRegistry.getInstance().getProjectService(user);
  const {
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  } = useDashboardHandlers(data?.profile, user, projectService.deleteProject.bind(projectService), refetch);

  const loading = authLoading || dataLoading;

  return {
    user,
    profile: data?.profile,
    projects: data?.projects || [],
    userCurrency,
    stats,
    loading,
    displayName,
    handleSignOut,
    handleEditProject,
    handleDeleteProject,
  };
};
```

### Usage Tracking Hook
```typescript
export const useUsageTracking = (profile: UserProfile | null, projects: Project[]) => {
  return useMemo(() => {
    if (!profile) return {
      canCreateProject: false,
      projectsUsed: 0,
      projectsLimit: 0,
      storageUsed: 0,
      storageLimit: 0,
    };

    const userType = profile.user_type || 'free';
    const limits = getUserPlanLimits(userType);

    return {
      canCreateProject: projects.length < limits.maxProjects,
      projectsUsed: projects.length,
      projectsLimit: limits.maxProjects,
      storageUsed: profile.storage_used || 0,
      storageLimit: limits.maxStorageMB * 1024 * 1024, // Convert MB to bytes
      clientsUsed: profile.client_count || 0,
      clientsLimit: limits.maxClients,
    };
  }, [profile, projects]);
};
```

## Error Handling & Loading States

### Global Error Boundary
```typescript
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    logSecurityEvent('frontend_error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Report to external service if needed
    if (process.env.NODE_ENV === 'production') {
      // Report to Sentry, LogRocket, etc.
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              We're sorry, but something unexpected happened.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Suspense Loading Components
```typescript
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const ComponentLoader = ({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6', 
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeMap[size]}`} />
    </div>
  );
};
```

This state management architecture provides a robust, scalable foundation for Ruzma's complex business logic while maintaining clear separation of concerns and excellent developer experience.