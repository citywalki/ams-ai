import { Pencil, Trash2, Key } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        return <Badge variant="success">{t('pages.userManagement.status.active')}</Badge>;
      case 'INACTIVE':
        return <Badge variant="warning">{t('pages.userManagement.status.inactive')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
            <Badge key={role.id} variant="secondary">
              {role.name}
            </Badge>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResetPassword(row.original)}
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}
