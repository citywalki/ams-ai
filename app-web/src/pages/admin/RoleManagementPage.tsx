import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, RotateCcw } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  systemApi,
  type RoleItem,
  type PermissionItem,
  type RolePayload,
} from '@/utils/api';

type RoleFormState = {
  code: string;
  name: string;
  description: string;
  permissionIds: number[];
};

const initialFormState: RoleFormState = {
  code: '',
  name: '',
  description: '',
  permissionIds: [],
};

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [formState, setFormState] = useState<RoleFormState>(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRole, setDeleteRole] = useState<RoleItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = searchKeyword ? { keyword: searchKeyword } : undefined;
      const res = await systemApi.getRoles(params);
      const roleList = Array.isArray(res.data) ? res.data : (res.data.content ?? res.data.items ?? []);
      setRoles(roleList);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载角色失败');
    } finally {
      setLoading(false);
    }
  }, [searchKeyword]);

  const loadPermissions = useCallback(async () => {
    try {
      const res = await systemApi.getPermissions();
      const permList = Array.isArray(res.data) ? res.data : (res.data.content ?? res.data.items ?? []);
      setPermissions(permList);
    } catch {
      console.error('Failed to load permissions');
    }
  }, []);

  useEffect(() => {
    void loadRoles();
    void loadPermissions();
  }, [loadRoles, loadPermissions]);

  const handleSearch = () => {
    void loadRoles();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setRoles([]);
    setTimeout(() => void loadRoles(), 0);
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setEditingRole(null);
    setFormState(initialFormState);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (role: RoleItem) => {
    setDialogMode('edit');
    setEditingRole(role);
    setFormState({
      code: role.code,
      name: role.name,
      description: role.description ?? '',
      permissionIds: role.permissionIds ?? role.permissions?.map((p) => p.id) ?? [],
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
    setFormState(initialFormState);
    setFormError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload: RolePayload = {
        code: formState.code,
        name: formState.name,
        description: formState.description || undefined,
        permissionIds: formState.permissionIds,
      };
      if (dialogMode === 'create') {
        await systemApi.createRole(payload);
      } else if (editingRole) {
        await systemApi.updateRole(editingRole.id, payload);
      }
      closeDialog();
      void loadRoles();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteDialog = (role: RoleItem) => {
    setDeleteRole(role);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteRole) return;
    setDeleteLoading(true);
    try {
      await systemApi.deleteRole(deleteRole.id);
      setDeleteOpen(false);
      setDeleteRole(null);
      void loadRoles();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const togglePermission = (permId: number) => {
    setFormState((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter((id) => id !== permId)
        : [...prev.permissionIds, permId],
    }));
  };

  const getPermissionBadge = (role: RoleItem) => {
    const count = role.permissionIds?.length ?? role.permissions?.length ?? 0;
    return (
      <Badge variant="secondary">
        {count} 个权限
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>角色管理</CardTitle>
          <CardDescription>管理系统角色和权限配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label>关键词</Label>
              <Input
                placeholder="输入角色名称或编码搜索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
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
              添加角色
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>角色列表</CardTitle>
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
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>编码</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>权限</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-mono">{role.code}</TableCell>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell>{getPermissionBadge(role)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(role)}
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
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' ? '添加角色' : '编辑角色'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'create' ? '创建新的系统角色' : '修改角色信息'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">编码</Label>
                  <Input
                    id="code"
                    value={formState.code}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder="如：ROLE_ADMIN"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">名称</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="如：管理员"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="角色描述（可选）"
                />
              </div>
              <div className="space-y-2">
                <Label>权限</Label>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  {permissions.length === 0 ? (
                    <div className="text-muted-foreground text-sm">暂无可选权限</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {permissions.map((perm) => (
                        <Button
                          key={perm.id}
                          type="button"
                          variant={
                            formState.permissionIds.includes(perm.id)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => togglePermission(perm.id)}
                        >
                          {perm.name}
                        </Button>
                      ))}
                    </div>
                  )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除角色 {deleteRole?.name} 吗？此操作不可撤销。
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
