import { useCallback, useEffect, useState } from 'react';
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
import {
  systemApi,
  type UserItem,
  type RoleOption,
  type UserCreatePayload,
  type UserUpdatePayload,
} from '@/utils/api';
import type { QueryParams, PageResponse } from '@/types/table';

type UserFormState = {
  username: string;
  email: string;
  password: string;
  status: string;
  roleIds: string[];
};

const initialFormState: UserFormState = {
  username: '',
  email: '',
  password: '',
  status: 'ACTIVE',
  roleIds: [],
};

async function fetchUsers(params: QueryParams, searchParams: Record<string, string>): Promise<PageResponse<UserItem>> {
  const res = await systemApi.getUsers({ ...params, ...searchParams });
  const userList = Array.isArray(res.data) ? res.data : (res.data.content ?? res.data.items ?? []);
  const totalCountHeader =
    (res.headers?.['x-total-count'] as string | number | undefined)
    ?? (res.headers?.['X-Total-Count'] as string | number | undefined);
  let totalCount = Number(totalCountHeader);
  if (Number.isNaN(totalCount)) {
    totalCount = Number(
      !Array.isArray(res.data)
        ? (res.data.totalElements ?? res.data.totalCount ?? userList.length)
        : userList.length,
    );
  }
  const totalPages = Math.ceil(totalCount / (params.size || 20));
  return {
    content: userList,
    totalElements: totalCount,
    totalPages,
    size: params.size || 20,
    number: params.page || 0,
  };
}

export default function UserManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [searchUsername, setSearchUsername] = useState('');
  const [queryUsername, setQueryUsername] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('all');
  const [queryStatus, setQueryStatus] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formState, setFormState] = useState<UserFormState>(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadRoles = useCallback(async () => {
    try {
      const res = await systemApi.getRoles();
      const roleList = Array.isArray(res.data) ? res.data : (res.data.content ?? res.data.items ?? []);
      setRoles(roleList);
    } catch {
      console.error('Failed to load roles');
    }
  }, []);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const handleSearch = () => {
    setQueryUsername(searchUsername.trim());
    setQueryStatus(searchStatus);
  };

  const handleReset = () => {
    setSearchUsername('');
    setSearchStatus('all');
    setQueryUsername('');
    setQueryStatus('all');
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setEditingUser(null);
    setFormState(initialFormState);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user: UserItem) => {
    setDialogMode('edit');
    setEditingUser(user);
    setFormState({
      username: user.username,
      email: user.email ?? '',
      password: '',
      status: user.status,
      roleIds: user.roles?.map((r) => r.id) ?? [],
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormState(initialFormState);
    setFormError(null);
  };

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }, [queryClient]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      if (dialogMode === 'create') {
        const payload: UserCreatePayload = {
          username: formState.username,
          email: formState.email || undefined,
          password: formState.password,
          status: formState.status,
          roleIds: formState.roleIds,
        };
        await systemApi.createUser(payload);
      } else if (editingUser) {
        const payload: UserUpdatePayload = {
          username: formState.username,
          email: formState.email || undefined,
          status: formState.status,
          roleIds: formState.roleIds,
        };
        await systemApi.updateUser(editingUser.id, payload);
      }
      closeDialog();
      refreshData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setFormLoading(false);
    }
  };

  const openResetPasswordDialog = (user: UserItem) => {
    setResetPasswordUser(user);
    setNewPassword('');
    setResetPasswordOpen(true);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return;
    setResetLoading(true);
    try {
      await systemApi.resetUserPassword(resetPasswordUser.id, newPassword);
      setResetPasswordOpen(false);
      setResetPasswordUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setResetLoading(false);
    }
  };

  const openDeleteDialog = (user: UserItem) => {
    setDeleteUser(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      await systemApi.deleteUser(deleteUser.id);
      setDeleteOpen(false);
      setDeleteUser(null);
      refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleRole = (roleId: string) => {
    setFormState((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="success">启用</Badge>;
      case 'INACTIVE':
        return <Badge variant="warning">禁用</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: ColumnDef<UserItem>[] = [
    {
      accessorKey: 'username',
      header: '用户名',
    },
    {
      accessorKey: 'email',
      header: '邮箱',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'roles',
      header: '角色',
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
      header: '状态',
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
            onClick={() => openEditDialog(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openResetPasswordDialog(row.original)}
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
    <div className="h-full min-h-0 flex flex-col gap-6">
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle>用户管理</CardTitle>
          <CardDescription>管理系统用户账户、角色分配和权限设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label>用户名</Label>
              <Input
                placeholder="输入用户名搜索..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-[180px] space-y-2">
              <Label>状态</Label>
              <Select value={searchStatus} onValueChange={setSearchStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="ACTIVE">启用</SelectItem>
                  <SelectItem value="INACTIVE">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              {t('common.search')}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('common.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>用户列表</CardTitle>
          <Button variant="ghost" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {t('common.add')}
          </Button>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            queryKey={['users']}
            queryFn={(params) => fetchUsers(params, searchParams)}
            defaultSort={{ id: 'createdAt', desc: true }}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' ? '添加用户' : '编辑用户'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'create'
                  ? '创建新的系统用户账户'
                  : '修改用户账户信息'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  value={formState.username}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, username: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              {dialogMode === 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formState.password}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">启用</SelectItem>
                    <SelectItem value="INACTIVE">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>角色</Label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Button
                      key={role.id}
                      type="button"
                      variant={
                        formState.roleIds.includes(role.id) ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => toggleRole(role.id)}
                    >
                      {role.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? '提交中...' : t('common.confirm')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              为用户 {resetPasswordUser?.username} 设置新密码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? '处理中...' : t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除用户 {deleteUser?.username} 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? '删除中...' : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
