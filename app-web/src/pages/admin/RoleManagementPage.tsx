import {useCallback, useEffect, useState} from 'react';
import {ChevronDown, ChevronRight, FileText, Folder, FolderOpen, Menu, Pencil, Plus, RotateCcw, Search, Trash2,} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
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
import {Alert, AlertDescription} from '@/components/ui/alert';
import {menuApi, type MenuItem, type PermissionItem, type RoleItem, type RolePayload, systemApi,} from '@/utils/api';

type RoleFormState = {
  code: string;
  name: string;
  description: string;
  permissionIds: string[];
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
  const [queryKeyword, setQueryKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [formState, setFormState] = useState<RoleFormState>(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRole, setDeleteRole] = useState<RoleItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuSaving, setMenuSaving] = useState(false);
  const [editingRoleForMenu, setEditingRoleForMenu] = useState<RoleItem | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const loadRoles = useCallback(async (
    targetPage = currentPage,
    targetPageSize = pageSize,
    targetKeyword = queryKeyword,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params: { page: number; size: number; keyword?: string } = {
        page: Math.max(targetPage - 1, 0),
        size: targetPageSize,
      };
      if (targetKeyword) {
        params.keyword = targetKeyword;
      }
      const res = await systemApi.getRoles(params);
      const roleList = Array.isArray(res.data) ? res.data : (res.data.content ?? res.data.items ?? []);
      const totalCountHeader =
        (res.headers?.['x-total-count'] as string | number | undefined)
        ?? (res.headers?.['X-Total-Count'] as string | number | undefined);
      let totalCount = Number(totalCountHeader);
      if (Number.isNaN(totalCount)) {
        totalCount = Number(
          !Array.isArray(res.data)
            ? (res.data.totalElements ?? res.data.totalCount ?? roleList.length)
            : roleList.length,
        );
      }
      setRoles(roleList);
      setTotal(totalCount);
      return roleList;
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载角色失败');
      return [] as RoleItem[];
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, queryKeyword]);

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
    void loadPermissions();
  }, [loadPermissions]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    if (keyword === queryKeyword && currentPage === 1) {
      void loadRoles(1, pageSize, keyword);
      return;
    }
    setQueryKeyword(keyword);
    setCurrentPage(1);
  };

  const handleReset = () => {
    if (!searchKeyword && !queryKeyword && currentPage === 1) {
      void loadRoles(1, pageSize, '');
      return;
    }
    setSearchKeyword('');
    setQueryKeyword('');
    setCurrentPage(1);
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

  const openMenuDialog = async (role: RoleItem) => {
    setEditingRoleForMenu(role);
    setMenuLoading(true);
    setMenuDialogOpen(true);
    try {
      const [treeRes, roleMenusRes] = await Promise.all([
        menuApi.getMenuTree(),
        systemApi.getRoleMenus(Number(role.id)),
      ]);
      setMenuTree(treeRes.data);
      const menuIds = roleMenusRes.data.menuIds || [];
      setSelectedMenuIds(new Set(menuIds.map(String)));
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setMenuLoading(false);
    }
  };

  const closeMenuDialog = () => {
    setMenuDialogOpen(false);
    setEditingRoleForMenu(null);
    setMenuTree([]);
    setSelectedMenuIds(new Set());
    setExpandedFolders(new Set());
  };

  const getAllDescendantIds = (menu: MenuItem): string[] => {
    const ids: string[] = [menu.id];
    if (menu.children) {
      for (const child of menu.children) {
        ids.push(...getAllDescendantIds(child));
      }
    }
    return ids;
  };

  const getChildrenIds = (menu: MenuItem): string[] => {
    const ids: string[] = [];
    if (menu.children) {
      for (const child of menu.children) {
        ids.push(child.id);
        ids.push(...getChildrenIds(child));
      }
    }
    return ids;
  };

  const getMenuSelectionState = (menu: MenuItem): 'all' | 'partial' | 'none' => {
    const childrenIds = getChildrenIds(menu);
    if (childrenIds.length === 0) {
      return selectedMenuIds.has(menu.id) ? 'all' : 'none';
    }
    const selectedCount = childrenIds.filter((id) => selectedMenuIds.has(id)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === childrenIds.length) return 'all';
    return 'partial';
  };

  const toggleMenuWithChildren = (menu: MenuItem) => {
    const state = getMenuSelectionState(menu);
    const descendants = getAllDescendantIds(menu);

    setSelectedMenuIds((prev) => {
      const next = new Set(prev);
      if (state === 'all') {
        descendants.forEach((id) => next.delete(id));
      } else {
        descendants.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleFolderExpand = (menuId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const handleMenuSave = async () => {
    if (!editingRoleForMenu) return;
    setMenuSaving(true);
    try {
      await systemApi.updateRoleMenus(
        Number(editingRoleForMenu.id),
        Array.from(selectedMenuIds)
      );
      closeMenuDialog();
      void loadRoles();
    } catch (err) {
      console.error('Failed to save menu association:', err);
    } finally {
      setMenuSaving(false);
    }
  };

  const renderCheckbox = (state: 'all' | 'partial' | 'none') => {
    if (state === 'all') {
      return (
        <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    if (state === 'partial') {
      return <div className="w-2.5 h-0.5 bg-primary-foreground rounded" />;
    }
    return null;
  };

  const renderMenuTree = (menus: MenuItem[], level = 0): React.ReactNode => {
    return menus.map((menu) => {
      const isFolder = menu.menuType === 'FOLDER';
      const hasChildren = menu.children && menu.children.length > 0;
      const isExpanded = expandedFolders.has(menu.id);
      const selectionState = getMenuSelectionState(menu);
      const isSelected = selectionState !== 'none';

      return (
        <div key={menu.id} className="select-none">
          <div
            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {isFolder && hasChildren && (
              <button
                type="button"
                className="p-0.5 hover:bg-muted-foreground/20 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpand(menu.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            )}
            {!isFolder && !hasChildren && <div className="w-4" />}
            <div
              className="flex items-center gap-2 flex-1"
              onClick={() => toggleMenuWithChildren(menu)}
            >
              {isFolder ? (
                isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-amber-500" />
                ) : (
                  <Folder className="h-4 w-4 text-amber-500" />
                )
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <div
                className={`w-4 h-4 border flex items-center justify-center ${
                  isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`}
              >
                {renderCheckbox(selectionState)}
              </div>
              <span className="text-sm">{menu.label}</span>
              <span className="text-xs text-muted-foreground font-mono">({menu.key})</span>
            </div>
          </div>
          {isFolder && hasChildren && isExpanded && renderMenuTree(menu.children!, level + 1)}
        </div>
      );
    });
  };

  const handleDelete = async () => {
    if (!deleteRole) return;
    setDeleteLoading(true);
    try {
      await systemApi.deleteRole(deleteRole.id);
      setDeleteOpen(false);
      setDeleteRole(null);
      const currentList = await loadRoles();
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

  const togglePermission = (permId: string) => {
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
    <div className="h-full min-h-0 flex flex-col gap-6">
      <Card className="shrink-0">
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
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>角色列表</CardTitle>
            <Button variant="ghost" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            添加角色
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
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无数据</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              <div className="table-scroll flex-1 min-h-0 overflow-auto">
                <Table className="border">
                  <TableHeader>
                    <TableRow>
                      <TableHead>编码</TableHead>
                      <TableHead>名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>权限</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role, index) => (
                      <TableRow key={role.id} className={index % 2 === 1 ? 'bg-muted/30' : ''}>
                        <TableCell className="font-mono">{role.code}</TableCell>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {role.description || '-'}
                        </TableCell>
                        <TableCell>{getPermissionBadge(role)}</TableCell>
                        <TableCell>
                           <div className="flex justify-start gap-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               title="关联菜单"
                               onClick={() => openMenuDialog(role)}
                             >
                               <Menu className="h-4 w-4" />
                             </Button>
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

      {/* Menu Association Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="max-w-lg h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle>关联菜单 - {editingRoleForMenu?.name}</DialogTitle>
            <DialogDescription>
              选择角色 "{editingRoleForMenu?.code}" 可访问的菜单
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            {menuLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : menuTree.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无菜单</div>
            ) : (
              <div className="border rounded-md h-full overflow-y-auto">
                {renderMenuTree(menuTree)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeMenuDialog}>
              取消
            </Button>
            <Button onClick={handleMenuSave} disabled={menuSaving}>
              {menuSaving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
