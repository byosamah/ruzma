import { BaseAPI } from '@/lib/api/base';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ErrorHandler } from './ErrorHandler';

export interface ServiceOptions {
  tableName: string;
  displayName?: string;
  userId?: string;
}

export abstract class BaseService<T> {
  protected api: BaseAPI<T>;
  protected tableName: string;
  protected displayName: string;
  protected userId?: string;

  constructor(options: ServiceOptions) {
    this.tableName = options.tableName;
    this.displayName = options.displayName || options.tableName;
    this.userId = options.userId;
    this.api = new BaseAPI<T>(this.tableName);
  }

  async findAll(filters?: Record<string, any>): Promise<T[]> {
    try {
      let query = supabase.from(this.tableName).select('*');
      
      if (this.userId) {
        query = query.eq('user_id', this.userId);
      }
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      ErrorHandler.handle(error, `${this.displayName}.findAll`);
      return [];
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      ErrorHandler.handle(error, `${this.displayName}.findById`);
      return null;
    }
  }

  async create(payload: Partial<T>): Promise<T | null> {
    try {
      const dataWithUser = this.userId ? { ...payload, user_id: this.userId } : payload;
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(dataWithUser)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success(`${this.displayName} created successfully`);
      return data;
    } catch (error) {
      ErrorHandler.handle(error, `${this.displayName}.create`);
      return null;
    }
  }

  async update(id: string, payload: Partial<T>): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success(`${this.displayName} updated successfully`);
      return data;
    } catch (error) {
      ErrorHandler.handle(error, `${this.displayName}.update`);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success(`${this.displayName} deleted successfully`);
      return true;
    } catch (error) {
      ErrorHandler.handle(error, `${this.displayName}.delete`);
      return false;
    }
  }

  async count(filters?: Record<string, any>): Promise<number> {
    try {
      let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });
      
      if (this.userId) {
        query = query.eq('user_id', this.userId);
      }
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      const { count, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return count || 0;
    } catch (error) {
      ErrorHandler.handle(error, `${this.displayName}.count`);
      return 0;
    }
  }

  async exists(filters: Record<string, any>): Promise<boolean> {
    const count = await this.count(filters);
    return count > 0;
  }
}