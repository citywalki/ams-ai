import { Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Select, Space, Typography } from 'antd';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between py-3">
      <Space size={8}>
        <Typography.Text type="secondary">{t('table.pageSize')}</Typography.Text>
        <Select
          size="small"
          style={{ width: 84 }}
          value={`${table.getState().pagination.pageSize}`}
          onChange={(value) => {
            table.setPageSize(Number(value));
          }}
          options={[10, 20, 30, 50, 100].map((pageSize) => ({ value: `${pageSize}`, label: `${pageSize}` }))}
        />
        <Typography.Text type="secondary">{t('table.records')}</Typography.Text>
      </Space>
      <Space size={8}>
        <Space size={8}>
          <Button
            size="small"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronsLeft className="h-4 w-4" />}
          />
          <Button
            size="small"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronLeft className="h-4 w-4" />}
          />
          <Typography.Text>
            {t('table.page')} {table.getState().pagination.pageIndex + 1} {t('table.pageOf')} {table.getPageCount()} {t('table.pages')}
          </Typography.Text>
          <Button
            size="small"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            icon={<ChevronRight className="h-4 w-4" />}
          />
          <Button
            size="small"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            icon={<ChevronsRight className="h-4 w-4" />}
          />
        </Space>
      </Space>
    </div>
  );
}
