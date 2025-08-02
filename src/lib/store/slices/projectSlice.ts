import { StateCreator } from 'zustand';
import { ProjectAPI } from '@/lib/api/projects';
import { Project, ProjectFormData, ProjectFilters } from '@/types/project';

const projectAPI = new ProjectAPI();

export interface ProjectSlice {
  // State
  projects: Project[];
  currentProject: Project | null;
  filters: ProjectFilters;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
  
  // API operations
  fetchProjects: (page?: number, pageSize?: number) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: ProjectFormData) => Promise<{ data?: Project; error?: string }>;
  updateProject: (id: string, data: Partial<ProjectFormData>) => Promise<{ error?: string }>;
  deleteProject: (id: string) => Promise<{ error?: string }>;
  
  // Computed values
  getProjectById: (id: string) => Project | undefined;
  getProjectsByStatus: (status: string) => Project[];
  getActiveProjects: () => Project[];
  getCompletedProjects: () => Project[];
}

const defaultFilters: ProjectFilters = {
  status: null,
  clientId: null,
  search: '',
  dateRange: null,
  sortBy: 'created_at',
  sortOrder: 'desc'
};

export const createProjectSlice: StateCreator<ProjectSlice> = (set, get) => ({
  // Initial state
  projects: [],
  currentProject: null,
  filters: defaultFilters,
  totalCount: 0,
  isLoading: false,
  error: null,
  
  // Actions
  setProjects: (projects) => set({ projects }),
  
  setCurrentProject: (currentProject) => set({ currentProject }),
  
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  // API operations
  fetchProjects: async (page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    
    try {
      const { filters } = get();
      const result = await projectAPI.list({
        page,
        limit: pageSize,
        status: filters.status,
        client_id: filters.clientId,
        search: filters.search,
        start_date: filters.dateRange?.start,
        end_date: filters.dateRange?.end,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder
      });
      
      if (result.error) throw new Error(result.error);
      
      set({
        projects: result.data || [],
        totalCount: result.total || 0,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
  
  fetchProject: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await projectAPI.get(id);
      
      if (result.error) throw new Error(result.error);
      
      set({
        currentProject: result.data || null,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
  
  createProject: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await projectAPI.create(data);
      
      if (result.error) throw new Error(result.error);
      
      if (result.data) {
        set((state) => ({
          projects: [result.data, ...state.projects],
          isLoading: false
        }));
      }
      
      return { data: result.data };
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await projectAPI.update(id, data);
      
      if (result.error) throw new Error(result.error);
      
      if (result.data) {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === id ? result.data! : p
          ),
          currentProject: state.currentProject?.id === id 
            ? result.data 
            : state.currentProject,
          isLoading: false
        }));
      }
      
      return {};
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await projectAPI.delete(id);
      
      if (result.error) throw new Error(result.error);
      
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id 
          ? null 
          : state.currentProject,
        isLoading: false
      }));
      
      return {};
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  // Computed values
  getProjectById: (id) => {
    return get().projects.find(p => p.id === id);
  },
  
  getProjectsByStatus: (status) => {
    return get().projects.filter(p => p.status === status);
  },
  
  getActiveProjects: () => {
    return get().projects.filter(p => p.status === 'active');
  },
  
  getCompletedProjects: () => {
    return get().projects.filter(p => p.status === 'completed');
  }
});