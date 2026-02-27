import { useCallback, useState } from 'react';
import { Plus, Pencil, Trash2, Key, Search, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/tables/DataTable';
import { queryKeys } from '@/lib/queryKeys';
import { fetchUsersPage, invalidateUserList } from '@/features/admin/users/queries';
import { useDeleteUser } from '@/features/admin/users/mutations';
import { useUserForm } from '@/features/admin/users/hooks/useUserForm';
import { useResetPassword } from '@/features/admin/users/hooks/useResetPassword';
import { UserFormDialog } from '@/features/admin/users/components/UserFormDialog';
import { ResetPasswordDialog } from '@/features/admin/users/components/ResetPasswordDialog';
import { type UserItem } from '@/utils/api';

export default function UserManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [searchUsername, setSearchUsername] = useState('');
  const [queryUsername, setQueryUsername] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('all');
  const [queryStatus, setQueryStatus] = useState<string>('all');

  // Use TanStack Form hooks
  const userForm = useUserForm();
  const resetPassword = useResetPassword();
  const deleteMutation = useDeleteUser();

  // Keep delete dialog state (not using TanStack Form)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);

  const handleSearch = () => {
    setQueryUsername(searchUsername.trim());
    setQueryStatus(searchStatus);
    void invalidateUserList(queryClient);
  };

  const handleReset = () => {
    setSearchUsername('');
    setSearchStatus('all');
    setQueryUsername('');
    setQueryStatus('all');
    void invalidateUserList(queryClient);
  };

  const refreshData = useCallback(() => {
    void invalidateUserList(queryClient);
  }, [queryClient]);

  const openDeleteDialog = (user: UserItem) => {
    setDeleteUser(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await deleteMutation.mutateAsync(deleteUser.id);
      setDeleteOpen(false);
      setDeleteUser(null);
    } catch {
      // Error is handled by mutation
    }
  };

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

  const columns: ColumnDef<UserItem>[] = [
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
            onClick={() => userForm.openEditDialog(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetPassword.openResetPasswordDialog(row.original)}
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDeleteDialog(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const searchParams: Record<string, string> = {};
  if (queryUsername) searchParams.username = queryUsername;
  if (queryStatus !== 'all') searchParams.status = queryStatus;

  return (
    <div className="h-full min-h-0 flex flex-col gap-3">
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle>{t('pages.userManagement.title')}</CardTitle>
          <CardDescription>{t('pages.userManagement.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label>{t('pages.userManagement.form.username')}</Label>
              <Input
                placeholder={t('pages.userManagement.form.usernameSearchPlaceholder')}
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="w-[180px] space-y-2">
              <Label>{t('pages.userManagement.form.status')}</Label>
              <Select value={searchStatus} onValueChange={setSearchStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('pages.userManagement.form.statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages.userManagement.status.all')}</SelectItem>
                  <SelectItem value="ACTIVE">{t('pages.userManagement.status.active')}</SelectItem>
                  <SelectItem value="INACTIVE">{t('pages.userManagement.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              {t('common.search')}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('common.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('pages.userManagement.listTitle')}</CardTitle>
          <Button variant="ghost" onClick={userForm.openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {t('common.add')}
          </Button>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            queryKey={queryKeys.users.list(searchParams)}
            queryFn={(params) => fetchUsersPage(params, searchParams)}
            defaultSort={{ id: 'createdAt', desc: true }}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <UserFormDialog
        open={userForm.dialogOpen}
        onOpenChange={userForm.setDialogOpen}
        mode={userForm.dialogMode}
        form={userForm.form}
        error={userForm.formError}
        onClose={userForm.closeDialog}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetPassword.resetPasswordOpen}
        onOpenChange={resetPassword.setResetPasswordOpen}
        user={resetPassword.resetPasswordUser}
        form={resetPassword.form}
        error={resetPassword.resetPasswordError}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.userManagement.dialog.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.userManagement.dialog.deleteDescription', { username: deleteUser?.username ?? '-' })}
            </DialogDescription>
          </DialogHeader>
          {deleteMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>{deleteMutation.error.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('pages.userManagement.messages.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
