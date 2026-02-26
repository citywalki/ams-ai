import { SortingState } from '@tanstack/react-table';

export interface QueryParams {
  page: number;
  size: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface TableQueryState {
  sorting: SortingState;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface SortConfig {
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}
