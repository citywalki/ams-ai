import { useState } from 'react';
import { Plus, Pencil, Trash2, Key, Search, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Card, Col, Input, Modal, Row, Select, Space, Tag, Typography } from 'antd';
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
import { type UserItem } from '@/lib/types';

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
        return <Tag color="green">{t('pages.userManagement.status.active')}</Tag>;
      case 'INACTIVE':
        return <Tag color="orange">{t('pages.userManagement.status.inactive')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
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
          <Button
            type="text"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => userForm.openEditDialog(row.original)}
          />
          <Button
            type="text"
            icon={<Key className="h-4 w-4" />}
            onClick={() => resetPassword.openResetPasswordDialog(row.original)}
          />
          <Button
            type="text"
            danger
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => openDeleteDialog(row.original)}
          />
        </div>
      ),
    },
  ];

  const searchParams: Record<string, string> = {};
  if (queryUsername) searchParams.username = queryUsername;
  if (queryStatus !== 'all') searchParams.status = queryStatus;

  return (
    <div className="h-full min-h-0 flex flex-col gap-3">
      <Card className="shrink-0" title={t('pages.userManagement.title')}>
        <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
          {t('pages.userManagement.description')}
        </Typography.Paragraph>
        <Row gutter={[12, 12]} align="bottom">
          <Col flex="auto" style={{ minWidth: 220 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={6}>
              <Typography.Text>{t('pages.userManagement.form.username')}</Typography.Text>
              <Input
                placeholder={t('pages.userManagement.form.usernameSearchPlaceholder')}
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onPressEnter={handleSearch}
              />
            </Space>
          </Col>
          <Col style={{ width: 180 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={6}>
              <Typography.Text>{t('pages.userManagement.form.status')}</Typography.Text>
              <Select
                value={searchStatus}
                onChange={setSearchStatus}
                options={[
                  { value: 'all', label: t('pages.userManagement.status.all') },
                  { value: 'ACTIVE', label: t('pages.userManagement.status.active') },
                  { value: 'INACTIVE', label: t('pages.userManagement.status.inactive') },
                ]}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<Search className="h-4 w-4" />} onClick={handleSearch}>
                {t('common.search')}
              </Button>
              <Button icon={<RotateCcw className="h-4 w-4" />} onClick={handleReset}>
                {t('common.reset')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        className="flex-1 min-h-0 flex flex-col"
        title={t('pages.userManagement.listTitle')}
        extra={(
          <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={userForm.openCreateDialog}>
            {t('common.add')}
          </Button>
        )}
      >
        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            queryKey={queryKeys.users.list(searchParams)}
            queryFn={(params) => fetchUsersPage(params, searchParams)}
            defaultSort={{ id: 'createdAt', desc: true }}
          />
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      <UserFormDialog
        open={userForm.dialogOpen}
        onOpenChange={userForm.setDialogOpen}
        mode={userForm.dialogMode}
        initialValues={userForm.formData}
        error={userForm.formError}
        onClose={userForm.closeDialog}
        onSubmit={userForm.submitForm}
        isSubmitting={userForm.isSubmitting}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetPassword.resetPasswordOpen}
        onOpenChange={resetPassword.setResetPasswordOpen}
        user={resetPassword.resetPasswordUser}
        newPassword={resetPassword.newPassword}
        onPasswordChange={resetPassword.setNewPassword}
        error={resetPassword.resetPasswordError}
        onSubmit={resetPassword.submitResetPassword}
        isSubmitting={resetPassword.isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <Modal
        destroyOnHidden
        open={deleteOpen}
        title={t('pages.userManagement.dialog.deleteTitle')}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
        onCancel={() => setDeleteOpen(false)}
        onOk={() => void handleDelete()}
      >
        <p>{t('pages.userManagement.dialog.deleteDescription', { username: deleteUser?.username ?? '-' })}</p>
        {deleteMutation.error && (
          <Alert
            style={{ marginTop: 12 }}
            type="error"
            showIcon
            message={deleteMutation.error.message}
          />
        )}
      </Modal>
    </div>
  );
}
