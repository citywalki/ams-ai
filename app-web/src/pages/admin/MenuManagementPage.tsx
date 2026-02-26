import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, ChevronRight, Search, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Switch } from '@/components/ui/switch';
import {
  menuApi,
  type MenuItem,
  type MenuPayload,
  type PermissionItem,
  type PermissionPayload,
} from '@/utils/api';

type MenuFormState = {
  key: string;
  label: string;
  route: string;
  icon: string;
  sortOrder: number;
  isVisible: boolean;
  menuType: 'FOLDER' | 'MENU';
  rolesAllowed: string;
};

type PermissionFormState = {
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  buttonType: string;
};

const initialMenuForm: MenuFormState = {
  key: '',
  label: '',
  route: '',
  icon: '',
  sortOrder: 0,
  isVisible: true,
  menuType: 'MENU',
  rolesAllowed: '',
};

const initialPermissionForm: PermissionFormState = {
  code: '',
  name: '',
  description: '',
  sortOrder: 0,
  buttonType: '',
};

export default function MenuManagementPage() {
  const [folders, setFolders] = useState<MenuItem[]>([]);
  const [folderSearch, setFolderSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<MenuItem | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [menusLoading, setMenusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [menuDialogMode, setMenuDialogMode] = useState<'create' | 'edit'>('create');
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<MenuFormState>(initialMenuForm);
  const [menuFormLoading, setMenuFormLoading] = useState(false);
  const [menuFormError, setMenuFormError] = useState<string | null>(null);

  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedMenuForPermission, setSelectedMenuForPermission] = useState<MenuItem | null>(null);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const [permissionFormDialogOpen, setPermissionFormDialogOpen] = useState(false);
  const [permissionFormMode, setPermissionFormMode] = useState<'create' | 'edit'>('create');
  const [editingPermission, setEditingPermission] = useState<PermissionItem | null>(null);
  const [permissionForm, setPermissionForm] = useState<PermissionFormState>(initialPermissionForm);
  const [permissionFormLoading, setPermissionFormLoading] = useState(false);
  const [permissionFormError, setPermissionFormError] = useState<string | null>(null);

  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState<MenuItem | null>(null);
  const [deleteMenuLoading, setDeleteMenuLoading] = useState(false);

  const [deletePermissionOpen, setDeletePermissionOpen] = useState(false);
  const [deletePermission, setDeletePermission] = useState<PermissionItem | null>(null);
  const [deletePermissionLoading, setDeletePermissionLoading] = useState(false);

  const loadFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await menuApi.getFolders();
      setFolders(res.data);
      if (res.data.length > 0 && !selectedFolder) {
        setSelectedFolder(res.data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载菜单分类失败');
    } finally {
      setLoading(false);
    }
  }, [selectedFolder]);

  const loadMenus = useCallback(async (parentId: string) => {
    setMenusLoading(true);
    try {
      const res = await menuApi.getMenusByParent(parentId);
      setMenus(res.data);
    } catch (err) {
      console.error('Failed to load menus:', err);
      setMenus([]);
    } finally {
      setMenusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    if (selectedFolder) {
      void loadMenus(selectedFolder.id);
    }
  }, [selectedFolder, loadMenus]);

  const selectFolder = (folder: MenuItem) => {
    setSelectedFolder(folder);
  };

  const openCreateMenuDialog = () => {
    setMenuDialogMode('create');
    setEditingMenu(null);
    setMenuForm(initialMenuForm);
    setMenuFormError(null);
    setMenuDialogOpen(true);
  };

  const openEditMenuDialog = (menu: MenuItem) => {
    setMenuDialogMode('edit');
    setEditingMenu(menu);
    setMenuForm({
      key: menu.key,
      label: menu.label,
      route: menu.route || '',
      icon: menu.icon || '',
      sortOrder: menu.sortOrder,
      isVisible: menu.isVisible,
      menuType: menu.menuType,
      rolesAllowed: (menu.rolesAllowed || []).join(','),
    });
    setMenuFormError(null);
    setMenuDialogOpen(true);
  };

  const closeMenuDialog = () => {
    setMenuDialogOpen(false);
    setEditingMenu(null);
    setMenuForm(initialMenuForm);
    setMenuFormError(null);
  };

  const handleMenuFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMenuFormLoading(true);
    setMenuFormError(null);
    try {
      const payload: MenuPayload = {
        key: menuForm.key,
        label: menuForm.label,
        route: menuForm.route || undefined,
        parentId: selectedFolder?.id,
        icon: menuForm.icon || undefined,
        sortOrder: menuForm.sortOrder,
        isVisible: menuForm.isVisible,
        menuType: menuForm.menuType,
        rolesAllowed: menuForm.rolesAllowed
          ? menuForm.rolesAllowed.split(',').map((r) => r.trim()).filter(Boolean)
          : undefined,
      };
      if (menuDialogMode === 'create') {
        await menuApi.createMenu(payload);
      } else if (editingMenu) {
        await menuApi.updateMenu(editingMenu.id, payload);
      }
      closeMenuDialog();
      if (selectedFolder) {
        void loadMenus(selectedFolder.id);
      }
    } catch (err) {
      setMenuFormError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setMenuFormLoading(false);
    }
  };

  const openDeleteMenuDialog = (menu: MenuItem) => {
    setDeleteMenu(menu);
    setDeleteMenuOpen(true);
  };

  const handleDeleteMenu = async () => {
    if (!deleteMenu) return;
    setDeleteMenuLoading(true);
    try {
      await menuApi.deleteMenu(deleteMenu.id);
      setDeleteMenuOpen(false);
      setDeleteMenu(null);
      if (selectedFolder) {
        void loadMenus(selectedFolder.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteMenuLoading(false);
    }
  };

  const openPermissionDialog = async (menu: MenuItem) => {
    setSelectedMenuForPermission(menu);
    setPermissionDialogOpen(true);
    setPermissionsLoading(true);
    try {
      const res = await menuApi.getMenuPermissions(menu.id);
      setPermissions(res.data);
    } catch (err) {
      console.error('Failed to load permissions:', err);
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const openCreatePermissionDialog = () => {
    setPermissionFormMode('create');
    setEditingPermission(null);
    setPermissionForm(initialPermissionForm);
    setPermissionFormError(null);
    setPermissionFormDialogOpen(true);
  };

  const openEditPermissionDialog = (permission: PermissionItem) => {
    setPermissionFormMode('edit');
    setEditingPermission(permission);
    setPermissionForm({
      code: permission.code,
      name: permission.name,
      description: permission.description || '',
      sortOrder: permission.sortOrder || 0,
      buttonType: permission.buttonType || '',
    });
    setPermissionFormError(null);
    setPermissionFormDialogOpen(true);
  };

  const closePermissionFormDialog = () => {
    setPermissionFormDialogOpen(false);
    setEditingPermission(null);
    setPermissionForm(initialPermissionForm);
    setPermissionFormError(null);
  };

  const handlePermissionFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuForPermission) return;
    setPermissionFormLoading(true);
    setPermissionFormError(null);
    try {
      const payload: PermissionPayload = {
        code: permissionForm.code,
        name: permissionForm.name,
        description: permissionForm.description || undefined,
        menuId: selectedMenuForPermission.id,
        sortOrder: permissionForm.sortOrder,
        buttonType: permissionForm.buttonType || undefined,
      };
      if (permissionFormMode === 'create') {
        await menuApi.createPermission(payload);
      } else if (editingPermission) {
        await menuApi.updatePermission(editingPermission.id, payload);
      }
      closePermissionFormDialog();
      const res = await menuApi.getMenuPermissions(selectedMenuForPermission.id);
      setPermissions(res.data);
    } catch (err) {
      setPermissionFormError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setPermissionFormLoading(false);
    }
  };

  const openDeletePermissionDialog = (permission: PermissionItem) => {
    setDeletePermission(permission);
    setDeletePermissionOpen(true);
  };

  const handleDeletePermission = async () => {
    if (!deletePermission || !selectedMenuForPermission) return;
    setDeletePermissionLoading(true);
    try {
      await menuApi.deletePermission(deletePermission.id);
      setDeletePermissionOpen(false);
      setDeletePermission(null);
      const res = await menuApi.getMenuPermissions(selectedMenuForPermission.id);
      setPermissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletePermissionLoading(false);
    }
  };

  const getMenuCountBadge = (folder: MenuItem) => {
    const count = menus.filter((m) => m.parentId === folder.id).length;
    return count;
  };

  return (
    <div className="h-full min-h-0 flex gap-4">
      <Card className="w-[280px] min-h-0 flex-shrink-0 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">菜单分类</CardTitle>
            <Button size="sm" onClick={openCreateMenuDialog}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索分类..."
              value={folderSearch}
              onChange={(e) => setFolderSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0 pt-0">
          {loading ? (
            <div className="space-y-2 px-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mx-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-full">
              <div className="px-6 py-2 space-y-1">
                {folders
                  .filter((f) =>
                    folderSearch
                      ? f.label.toLowerCase().includes(folderSearch.toLowerCase()) ||
                        f.key.toLowerCase().includes(folderSearch.toLowerCase())
                      : true
                  )
                  .map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer group ${
                      selectedFolder?.id === folder.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => selectFolder(folder)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FolderOpen className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm">{folder.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getMenuCountBadge(folder)}
                      </Badge>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditMenuDialog(folder);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteMenuDialog(folder);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {folders.filter((f) =>
                    folderSearch
                      ? f.label.toLowerCase().includes(folderSearch.toLowerCase()) ||
                        f.key.toLowerCase().includes(folderSearch.toLowerCase())
                      : true
                  ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm px-6">
                    暂无分类
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {selectedFolder ? selectedFolder.label : '菜单项'}
              </CardTitle>
              {selectedFolder?.route && (
                <CardDescription>{selectedFolder.route}</CardDescription>
              )}
            </div>
            {selectedFolder && (
              <Button size="sm" onClick={openCreateMenuDialog}>
                <Plus className="h-4 w-4 mr-1" />
                添加菜单
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          {!selectedFolder ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <ChevronRight className="h-4 w-4 mr-2" />
              请选择左侧分类
            </div>
          ) : menusLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : menus.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              暂无菜单项
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>路由</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>可见</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell className="font-mono text-sm">{menu.key}</TableCell>
                      <TableCell>{menu.label}</TableCell>
                      <TableCell className="font-mono text-sm">{menu.route || '-'}</TableCell>
                      <TableCell>{menu.sortOrder}</TableCell>
                      <TableCell>
                        {menu.isVisible
                          ? <Badge variant="success">是</Badge>
                          : <Badge variant="secondary">否</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-start gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="编辑权限"
                            onClick={() => openPermissionDialog(menu)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditMenuDialog(menu)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteMenuDialog(menu)}
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
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Menu Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent>
          <form onSubmit={handleMenuFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {menuDialogMode === 'create' ? '新增菜单' : '编辑菜单'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {menuFormError && (
                <Alert variant="destructive">
                  <AlertDescription>{menuFormError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Key</Label>
                <Input
                  value={menuForm.key}
                  onChange={(e) => setMenuForm((p) => ({ ...p, key: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>名称</Label>
                <Input
                  value={menuForm.label}
                  onChange={(e) => setMenuForm((p) => ({ ...p, label: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>路由</Label>
                <Input
                  value={menuForm.route}
                  onChange={(e) => setMenuForm((p) => ({ ...p, route: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>图标</Label>
                <Input
                  value={menuForm.icon}
                  onChange={(e) => setMenuForm((p) => ({ ...p, icon: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>允许角色（逗号分隔）</Label>
                <Input
                  value={menuForm.rolesAllowed}
                  onChange={(e) => setMenuForm((p) => ({ ...p, rolesAllowed: e.target.value }))}
                  placeholder="ROLE_ADMIN,ROLE_USER"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>排序</Label>
                  <Input
                    type="number"
                    value={menuForm.sortOrder}
                    onChange={(e) => setMenuForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>类型</Label>
                  <Select
                    value={menuForm.menuType}
                    onValueChange={(v: 'FOLDER' | 'MENU') => setMenuForm((p) => ({ ...p, menuType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOLDER">目录</SelectItem>
                      <SelectItem value="MENU">菜单</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={menuForm.isVisible}
                  onCheckedChange={(checked) => setMenuForm((p) => ({ ...p, isVisible: checked }))}
                />
                <Label>可见</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeMenuDialog}>
                取消
              </Button>
              <Button type="submit" disabled={menuFormLoading}>
                {menuFormLoading ? '提交中...' : '确定'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permission Dialog */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              权限管理 - {selectedMenuForPermission?.label}
            </DialogTitle>
            <DialogDescription>
              管理菜单 "{selectedMenuForPermission?.key}" 的按钮权限
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-end mb-4">
              <Button size="sm" onClick={openCreatePermissionDialog}>
                <Plus className="h-4 w-4 mr-1" />
                添加权限
              </Button>
            </div>
            {permissionsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : permissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无权限
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>编码</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>按钮类型</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-mono text-sm">{permission.code}</TableCell>
                      <TableCell>{permission.name}</TableCell>
                      <TableCell>{permission.sortOrder ?? '-'}</TableCell>
                      <TableCell>{permission.buttonType || '-'}</TableCell>
                      <TableCell>
                        <div className="flex justify-start gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditPermissionDialog(permission)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeletePermissionDialog(permission)}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Form Dialog */}
      <Dialog open={permissionFormDialogOpen} onOpenChange={setPermissionFormDialogOpen}>
        <DialogContent>
          <form onSubmit={handlePermissionFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {permissionFormMode === 'create' ? '新增权限' : '编辑权限'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {permissionFormError && (
                <Alert variant="destructive">
                  <AlertDescription>{permissionFormError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>编码</Label>
                <Input
                  value={permissionForm.code}
                  onChange={(e) => setPermissionForm((p) => ({ ...p, code: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>名称</Label>
                <Input
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Input
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>排序</Label>
                  <Input
                    type="number"
                    value={permissionForm.sortOrder}
                    onChange={(e) => setPermissionForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>按钮类型</Label>
                  <Input
                    value={permissionForm.buttonType}
                    onChange={(e) => setPermissionForm((p) => ({ ...p, buttonType: e.target.value }))}
                    placeholder="primary, danger..."
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closePermissionFormDialog}>
                取消
              </Button>
              <Button type="submit" disabled={permissionFormLoading}>
                {permissionFormLoading ? '提交中...' : '确定'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Menu Dialog */}
      <Dialog open={deleteMenuOpen} onOpenChange={setDeleteMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除菜单 "{deleteMenu?.label}" 吗？请先删除子菜单和关联权限。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMenuOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteMenu} disabled={deleteMenuLoading}>
              {deleteMenuLoading ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      <Dialog open={deletePermissionOpen} onOpenChange={setDeletePermissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除权限 "{deletePermission?.name}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePermissionOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeletePermission} disabled={deletePermissionLoading}>
              {deletePermissionLoading ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
