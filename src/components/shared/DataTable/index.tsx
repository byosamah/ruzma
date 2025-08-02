import React, { useState, useMemo, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Column definition for DataTable
 */
export interface DataTableColumn<T> {
  key: string;
  header: string | ReactNode;
  accessor: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

/**
 * DataTable context
 */
interface DataTableContextValue<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' } | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const DataTableContext = React.createContext<DataTableContextValue<any> | null>(null);

function useDataTableContext<T>() {
  const context = React.useContext(DataTableContext);
  if (!context) {
    throw new Error('DataTable components must be used within DataTable.Root');
  }
  return context as DataTableContextValue<T>;
}

/**
 * DataTable Root Component
 */
interface DataTableRootProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

export function DataTableRoot<T>({
  data,
  columns,
  loading = false,
  children,
  className
}: DataTableRootProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const value = useMemo(
    () => ({
      data,
      columns,
      loading,
      searchTerm,
      setSearchTerm,
      sortConfig,
      setSortConfig,
      currentPage,
      setCurrentPage,
      pageSize,
      setPageSize
    }),
    [data, columns, loading, searchTerm, sortConfig, currentPage, pageSize]
  );

  return (
    <DataTableContext.Provider value={value}>
      <div className={cn('space-y-4', className)}>
        {children}
      </div>
    </DataTableContext.Provider>
  );
}

/**
 * DataTable Search Component
 */
export function DataTableSearch({ placeholder = 'Search...', className }: { 
  placeholder?: string;
  className?: string;
}) {
  const { searchTerm, setSearchTerm } = useDataTableContext();

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

/**
 * DataTable Filters Component
 */
export function DataTableFilters({ children, className }: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  );
}

/**
 * DataTable Header Component
 */
export function DataTableHeader({ className }: { className?: string }) {
  const { columns, sortConfig, setSortConfig } = useDataTableContext();

  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  return (
    <TableHeader className={className}>
      <TableRow>
        {columns.map((column) => (
          <TableHead
            key={column.key}
            className={cn(
              column.sortable && 'cursor-pointer select-none',
              column.headerClassName
            )}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <div className="flex items-center gap-2">
              {column.header}
              {column.sortable && sortConfig?.key === column.key && (
                <span className="text-xs">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

/**
 * DataTable Body Component
 */
export function DataTableBody<T>({ className }: { className?: string }) {
  const { 
    data, 
    columns, 
    loading, 
    searchTerm, 
    sortConfig, 
    currentPage, 
    pageSize 
  } = useDataTableContext<T>();

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        const value = column.accessor(row);
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }, [data, columns, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const column = columns.find(col => col.key === sortConfig.key);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  if (loading) {
    return (
      <TableBody className={className}>
        {Array.from({ length: pageSize }).map((_, i) => (
          <TableRow key={i}>
            {columns.map((column) => (
              <TableCell key={column.key}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  if (paginatedData.length === 0) {
    return (
      <TableBody className={className}>
        <TableRow>
          <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
            No data found
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody className={className}>
      {paginatedData.map((row, index) => (
        <DataTableRow key={index} row={row} />
      ))}
    </TableBody>
  );
}

/**
 * DataTable Row Component
 */
export function DataTableRow<T>({ row, className }: { row: T; className?: string }) {
  const { columns } = useDataTableContext<T>();

  return (
    <TableRow className={className}>
      {columns.map((column) => (
        <TableCell key={column.key} className={column.className}>
          {column.accessor(row)}
        </TableCell>
      ))}
    </TableRow>
  );
}

/**
 * DataTable Pagination Component
 */
export function DataTablePagination({ className }: { className?: string }) {
  const { 
    data, 
    searchTerm, 
    currentPage, 
    setCurrentPage, 
    pageSize,
    setPageSize
  } = useDataTableContext();

  const totalItems = searchTerm 
    ? data.filter(item => JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())).length
    : data.length;
  
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Rows per page:
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="h-8 w-16 rounded border bg-background px-2 text-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Complete DataTable Component
 */
export const DataTable = {
  Root: DataTableRoot,
  Search: DataTableSearch,
  Filters: DataTableFilters,
  Header: DataTableHeader,
  Body: DataTableBody,
  Row: DataTableRow,
  Pagination: DataTablePagination,
  Cell: TableCell,
  Table,
};

/**
 * Simple DataTable wrapper for quick usage
 */
export function SimpleDataTable<T>({
  data,
  columns,
  loading,
  searchable = true,
  paginated = true,
  pageSize = 10,
  className
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  searchable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  className?: string;
}) {
  return (
    <DataTable.Root data={data} columns={columns} loading={loading} className={className}>
      {searchable && <DataTable.Search />}
      <Table>
        <DataTable.Header />
        <DataTable.Body />
      </Table>
      {paginated && <DataTable.Pagination />}
    </DataTable.Root>
  );
}