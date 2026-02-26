import { Menu, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type RoleItem } from '@/utils/api';

interface CreateColumnsOptions {
  t: (key: string, options?: Record<string, unknown>) => string;
  onEdit: (role: RoleItem) => void;
  onMenuConfig: (role: RoleItem) => void;
  onDelete: (role: RoleItem) => void;
}

export function createColumns({
  t,
  onEdit,
  onMenuConfig,
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
          <Badge variant="secondary">
            {t('pages.roleManagement.columns.permissionsCount', { count })}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex justify-start gap-2">
          <Button
            variant="ghost"
            size="sm"
            title={t('pages.roleManagement.actions.associateMenus')}
            onClick={() => onMenuConfig(row.original)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
            <Pencil className="h-4 w-4" />
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
