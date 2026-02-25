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
  roleIds: number[];
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
  const [searchStatus, setSearchStatus] = useState<string>('all');

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

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | undefined> = {};
      if (searchUsername) params.username = searchUsername;
      if (searchStatus !== 'all') params.status = searchStatus;
      const res = await systemApi.getUsers(params);
      setUsers(res.data.content ?? res.data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载用户失败');
    } finally {
      setLoading(false);
    }
  }, [searchUsername, searchStatus]);

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
    void loadUsers();
  };

  const handleReset = () => {
    setSearchUsername('');
    setSearchStatus('all');
    setUsers([]);
    setTimeout(() => void loadUsers(), 0);
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
      void loadUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleRole = (roleId: number) => {
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
    <div className="space-y-6">
      <Card>
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
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              添加用户
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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
