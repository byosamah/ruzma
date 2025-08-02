import { supabase } from '@/integrations/supabase/client';
import { handleApiResponse, buildQuery, handleSupabaseError } from '@/lib/utils/api';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Base API class for common CRUD operations
 */
export abstract class BaseAPI<T = any> {
  protected tableName: string;
  protected selectQuery: string;

  constructor(tableName: string, selectQuery: string = '*') {
    this.tableName = tableName;
    this.selectQuery = selectQuery;
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string) {
    return handleApiResponse<T>(
      supabase
        .from(this.tableName)
        .select(this.selectQuery)
        .eq('id', id)
        .single()
    );
  }

  /**
   * Find all records with optional filters
   */
  async findAll(filters?: Record<string, any>) {
    let query = supabase
      .from(this.tableName)
      .select(this.selectQuery);

    if (filters) {
      query = buildQuery(query, filters);
    }

    return handleApiResponse<T[]>(query);
  }

  /**
   * Find records with pagination
   */
  async findPaginated(options: {
    page?: number;
    pageSize?: number;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
  }) {
    const { 
      page = 1, 
      pageSize = 10, 
      filters, 
      orderBy 
    } = options;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(this.tableName)
      .select(this.selectQuery, { count: 'exact' });

    if (filters) {
      query = buildQuery(query, filters);
    }

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    query = query.range(from, to);

    const response = await query;

    if (response.error) {
      return {
        error: handleSupabaseError(response.error),
        data: undefined,
        count: 0
      };
    }

    return {
      data: response.data as T[],
      count: response.count || 0,
      error: undefined
    };
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>) {
    return handleApiResponse<T>(
      supabase
        .from(this.tableName)
        .insert(data)
        .select(this.selectQuery)
        .single()
    );
  }

  /**
   * Create multiple records
   */
  async createMany(data: Partial<T>[]) {
    return handleApiResponse<T[]>(
      supabase
        .from(this.tableName)
        .insert(data)
        .select(this.selectQuery)
    );
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>) {
    return handleApiResponse<T>(
      supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select(this.selectQuery)
        .single()
    );
  }

  /**
   * Update multiple records
   */
  async updateMany(filters: Record<string, any>, data: Partial<T>) {
    let query = supabase
      .from(this.tableName)
      .update(data);

    query = buildQuery(query, filters);

    return handleApiResponse<T[]>(
      query.select(this.selectQuery)
    );
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string) {
    return handleApiResponse(
      supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
    );
  }

  /**
   * Delete multiple records
   */
  async deleteMany(filters: Record<string, any>) {
    let query = supabase
      .from(this.tableName)
      .delete();

    query = buildQuery(query, filters);

    return handleApiResponse(query);
  }

  /**
   * Count records
   */
  async count(filters?: Record<string, any>) {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (filters) {
      query = buildQuery(query, filters);
    }

    const response = await query;

    if (response.error) {
      return {
        error: handleSupabaseError(response.error),
        count: 0
      };
    }

    return {
      count: response.count || 0,
      error: undefined
    };
  }

  /**
   * Check if a record exists
   */
  async exists(filters: Record<string, any>): Promise<boolean> {
    const { count } = await this.count(filters);
    return count > 0;
  }

  /**
   * Execute raw query
   */
  protected async executeRaw<R = any>(
    queryBuilder: (supabase: typeof supabase) => any
  ) {
    return handleApiResponse<R>(queryBuilder(supabase));
  }
}