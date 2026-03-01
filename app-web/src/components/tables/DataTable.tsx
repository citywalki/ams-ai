import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Empty, Spin } from 'antd';
import { DataTablePagination } from './DataTablePagination';
import { QueryErrorDisplay } from '@/components/common/QueryErrorDisplay';
import type { QueryParams, PageResponse } from '@/types/table';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  queryKey: unknown[];
  queryFn: (params: QueryParams) => Promise<PageResponse<TData>>;
  defaultSort?: { id: string; desc: boolean };
  searchParams?: Record<string, string>;
}

export function DataTable<TData>({
  columns,
  queryKey,
  queryFn,
  defaultSort = { id: 'createdAt', desc: true },
  searchParams = {},
}: DataTableProps<TData>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([defaultSort]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKey, sorting, pagination, searchParams],
    queryFn: () =>
      queryFn({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? 'DESC' : 'ASC',
        ...searchParams,
      }),
  });

  const table = useReactTable({
    data: data?.content ?? [],
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
  });

  return (
    <div className="flex flex-col h-full gap-4">
      <QueryErrorDisplay error={error} onRetry={() => refetch()} size="inline" />
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--ams-color-surface-muted)] text-left text-[var(--ams-color-text-secondary)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none px-4 py-3 font-medium hover:bg-[var(--ams-color-surface)]"
                  >
                    <div className="flex items-center space-x-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && (
                        <ArrowUp className="h-4 w-4" />
                      )}
                      {header.column.getIsSorted() === 'desc' && (
                        <ArrowDown className="h-4 w-4" />
                      )}
                      {!header.column.getIsSorted() && header.column.getCanSort() && (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="h-24 px-4 py-8 text-center">
                  <Spin tip={t('common.loading')} />
                </td>
              </tr>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-t border-[var(--ams-color-border)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 px-4 py-8 text-center">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('table.noData')} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
