import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Key, Search, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  systemApi,
  type UserItem,
  type RoleOption,
  type UserCreatePayload,
  type UserUpdatePayload,
} from '@/utils/api';

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

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchUsername, setSearchUsername] = useState('');
  const [queryUsername, setQueryUsername] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('all');
  const [queryStatus, setQueryStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

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

  const loadUsers = useCallback(async (
    targetPage = currentPage,
    targetPageSize = pageSize,
    targetUsername = queryUsername,
    targetStatus = queryStatus,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | undefined> = {};
      params.page = Math.max(targetPage - 1, 0);
      params.size = targetPageSize;
      if (targetUsername) params.username = targetUsername;
      if (targetStatus !== 'all') params.status = targetStatus;
      const res = await systemApi.getUsers(params);
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
      setUsers(userList);
      setTotal(totalCount);
      return userList;
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载用户失败');
      return [] as UserItem[];
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, queryUsername, queryStatus]);

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
    void loadUsers();
    void loadRoles();
  }, [loadUsers, loadRoles]);

  const handleSearch = () => {
    const username = searchUsername.trim();
    const status = searchStatus;
    if (username === queryUsername && status === queryStatus && currentPage === 1) {
      void loadUsers(1, pageSize, username, status);
      return;
    }
    setQueryUsername(username);
    setQueryStatus(status);
    setCurrentPage(1);
  };

  const handleReset = () => {
    if (!searchUsername && searchStatus === 'all' && !queryUsername && queryStatus === 'all' && currentPage === 1) {
      void loadUsers(1, pageSize, '', 'all');
      return;
    }
    setSearchUsername('');
    setSearchStatus('all');
    setQueryUsername('');
    setQueryStatus('all');
    setCurrentPage(1);
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
      void loadUsers();
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
      const currentList = await loadUsers();
      if (currentList.length === 0 && currentPage > 1) {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePrevPage = () => {
    if (loading || currentPage <= 1) return;
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (loading || currentPage >= totalPages) return;
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    if (Number.isNaN(newSize) || newSize <= 0) return;
    setPageSize(newSize);
    setCurrentPage(1);
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
              搜索
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>用户列表</CardTitle>
          <Button variant="ghost" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            添加用户
          </Button>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex flex-col">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无数据</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              <div className="table-scroll flex-1 min-h-0 overflow-auto">
                <Table className="border">
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow key={user.id} className={index % 2 === 1 ? 'bg-muted/30' : ''}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.map((role) => (
                              <Badge key={role.id} variant="secondary">
                                {role.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-start gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openResetPasswordDialog(user)}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <div>
                  共 {total} 条，第 {currentPage}/{totalPages} 页
                </div>
                <div className="flex items-center gap-2">
                  <span>每页</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={handlePageSizeChange}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={loading || currentPage <= 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={loading || currentPage >= totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </div>
          )}
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
                取消
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? '提交中...' : '确定'}
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
              取消
            </Button>
            <Button onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? '处理中...' : '确定'}
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
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
