import { Menu, Users, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button, Tag } from 'antd';
import { type RoleItem } from '@/lib/types';

interface CreateColumnsOptions {
  t: (key: string, options?: Record<string, unknown>) => string;
  onEdit: (role: RoleItem) => void;
  onMenuConfig: (role: RoleItem) => void;
  onUserAssign: (role: RoleItem) => void;
  onDelete: (role: RoleItem) => void;
}

export function createColumns({
  t,
  onEdit,
  onMenuConfig,
  onUserAssign,
  onDelete,
}: CreateColumnsOptions): ColumnDef<RoleItem>[] {
  return [
    {
      accessorKey: 'code',
      header: t('pages.roleManagement.columns.code'),
      cell: ({ row }) => <span className="font-mono">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: t('pages.roleManagement.columns.name'),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'description',
      header: t('pages.roleManagement.columns.description'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.description || '-'}</span>
      ),
    },
    {
      accessorKey: 'permissions',
      header: t('pages.roleManagement.columns.permissions'),
      cell: ({ row }) => {
        const count =
          row.original.permissionIds?.length ?? row.original.permissions?.length ?? 0;
        return (
          <Tag color="blue">
            {t('pages.roleManagement.columns.permissionsCount', { count })}
          </Tag>
        );
      },
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex justify-start gap-2">
          <Button type="text" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(row.original)} />
          <Button
            type="text"
            icon={<Users className="h-4 w-4" />}
            title={t('pages.roleManagement.actions.associateUsers')}
            onClick={() => onUserAssign(row.original)}
          />
          <Button
            type="text"
            icon={<Menu className="h-4 w-4" />}
            title={t('pages.roleManagement.actions.associateMenus')}
            onClick={() => onMenuConfig(row.original)}
          />
          <Button
            type="text"
            danger
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => onDelete(row.original)}
          />
        </div>
      ),
    },
  ];
}
