import { Pencil, Trash2, Key } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button, Tag } from 'antd';
import { type UserItem } from '@/lib/types';

interface CreateColumnsOptions {
  t: (key: string, options?: Record<string, unknown>) => string;
  onEdit: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
}

export function createColumns({
  t,
  onEdit,
  onResetPassword,
  onDelete,
}: CreateColumnsOptions): ColumnDef<UserItem>[] {
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <Tag color="green">{t('pages.userManagement.status.active')}</Tag>;
      case 'INACTIVE':
        return <Tag color="orange">{t('pages.userManagement.status.inactive')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return [
    {
      accessorKey: 'username',
      header: t('pages.userManagement.columns.username'),
    },
    {
      accessorKey: 'email',
      header: t('pages.userManagement.columns.email'),
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'roles',
      header: t('pages.userManagement.columns.roles'),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles?.map((role) => (
            <Tag key={role.id}>
              {role.name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('pages.userManagement.columns.status'),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex justify-start gap-2">
          <Button type="text" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(row.original)} />
          <Button type="text" icon={<Key className="h-4 w-4" />} onClick={() => onResetPassword(row.original)} />
          <Button type="text" danger icon={<Trash2 className="h-4 w-4" />} onClick={() => onDelete(row.original)} />
        </div>
      ),
    },
  ];
}
