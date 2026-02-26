import {useCallback, useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {FolderOpen, Lock, Pencil, Plus, Search, Trash2} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Switch} from '@/components/ui/switch';
import {menuApi, type MenuItem, type MenuPayload, type PermissionItem, type PermissionPayload,} from '@/utils/api';
import {
  fetchFolders,
  fetchMenuPermissions,
  fetchMenusByFolder,
  invalidateMenuQueries,
} from '@/features/admin/menus/queries';

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
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [folders, setFolders] = useState<MenuItem[]>([]);
  const [folderSearch, setFolderSearch] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<'root' | MenuItem>('root');
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
      const data = await fetchFolders(queryClient);
      setFolders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pages.menuManagement.messages.loadFoldersFailed'));
    } finally {
      setLoading(false);
    }
  }, [queryClient, t]);

    const loadMenus = useCallback(async (folder: 'root' | MenuItem) => {
    setMenusLoading(true);
    try {
      const data = await fetchMenusByFolder(queryClient, folder);
      setMenus(data);
    } catch (err) {
      console.error('Failed to load menus:', err);
      setMenus([]);
    } finally {
      setMenusLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  useEffect(() => {
      void loadMenus(selectedFolder);
  }, [selectedFolder, loadMenus]);

    const selectFolder = (folder: 'root' | MenuItem) => {
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
          parentId: selectedFolder === 'root' ? undefined : selectedFolder?.id,
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
      await invalidateMenuQueries(queryClient);
      await loadFolders();
      closeMenuDialog();
      void loadMenus(selectedFolder);
    } catch (err) {
      setMenuFormError(err instanceof Error ? err.message : t('pages.menuManagement.messages.operationFailed'));
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
      await invalidateMenuQueries(queryClient);
      await loadFolders();
      setDeleteMenuOpen(false);
      setDeleteMenu(null);
      void loadMenus(selectedFolder);
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
      const data = await fetchMenuPermissions(queryClient, menu.id);
      setPermissions(data);
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
      await invalidateMenuQueries(queryClient);
      closePermissionFormDialog();
      const data = await fetchMenuPermissions(queryClient, selectedMenuForPermission.id);
      setPermissions(data);
    } catch (err) {
      setPermissionFormError(err instanceof Error ? err.message : t('pages.menuManagement.messages.operationFailed'));
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
      await invalidateMenuQueries(queryClient);
      setDeletePermissionOpen(false);
      setDeletePermission(null);
      const data = await fetchMenuPermissions(queryClient, selectedMenuForPermission.id);
      setPermissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletePermissionLoading(false);
    }
  };

  const getMenuCountBadge = (folder: MenuItem) => {
    const rawCount = folder.metadata?.menuCount;
    if (typeof rawCount === 'number') {
      return rawCount;
    }
    if (typeof rawCount === 'string') {
      const parsed = Number.parseInt(rawCount, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  return (
    <div className="h-full min-h-0 flex gap-4">
      <Card className="w-[280px] min-h-0 flex-shrink-0 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('pages.menuManagement.folderTitle')}</CardTitle>
            <Button size="sm" onClick={openCreateMenuDialog}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('pages.menuManagement.form.searchFolderPlaceholder')}
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
                  <div
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer group ${
                          selectedFolder === 'root'
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                      }`}
                      onClick={() => selectFolder('root')}
                  >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FolderOpen className="h-4 w-4 flex-shrink-0"/>
                          <span className="truncate text-sm">{t('pages.menuManagement.rootMenu')}</span>
                      </div>
                  </div>
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
                        typeof selectedFolder !== 'string' && selectedFolder?.id === folder.id
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
                    {t('pages.menuManagement.messages.noFolders')}
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
                  {selectedFolder === 'root' ? t('pages.menuManagement.rootMenu') : selectedFolder?.label}
              </CardTitle>
                {selectedFolder !== 'root' && selectedFolder?.route && (
                <CardDescription>{selectedFolder.route}</CardDescription>
              )}
            </div>
              <Button size="sm" onClick={openCreateMenuDialog}>
                  <Plus className="h-4 w-4 mr-1"/>
                  {t('pages.menuManagement.actions.addMenu')}
              </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
            {menusLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : menus.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {t('pages.menuManagement.messages.noMenus')}
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.name')}</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.route')}</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.sortOrder')}</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.visible')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
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
                          ? <Badge variant="success">{t('pages.menuManagement.form.yes')}</Badge>
                          : <Badge variant="secondary">{t('pages.menuManagement.form.no')}</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-start gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t('pages.menuManagement.actions.managePermissions')}
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
                {menuDialogMode === 'create'
                  ? t('pages.menuManagement.dialog.createMenuTitle')
                  : t('pages.menuManagement.dialog.editMenuTitle')}
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
                <Label>{t('pages.menuManagement.form.name')}</Label>
                <Input
                  value={menuForm.label}
                  onChange={(e) => setMenuForm((p) => ({ ...p, label: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.menuManagement.form.route')}</Label>
                <Input
                  value={menuForm.route}
                  onChange={(e) => setMenuForm((p) => ({ ...p, route: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.menuManagement.form.icon')}</Label>
                <Input
                  value={menuForm.icon}
                  onChange={(e) => setMenuForm((p) => ({ ...p, icon: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.menuManagement.form.rolesAllowed')}</Label>
                <Input
                  value={menuForm.rolesAllowed}
                  onChange={(e) => setMenuForm((p) => ({ ...p, rolesAllowed: e.target.value }))}
                  placeholder="ROLE_ADMIN,ROLE_USER"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('pages.menuManagement.form.sortOrder')}</Label>
                  <Input
                    type="number"
                    value={menuForm.sortOrder}
                    onChange={(e) => setMenuForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pages.menuManagement.form.type')}</Label>
                  <Select
                    value={menuForm.menuType}
                    onValueChange={(v: 'FOLDER' | 'MENU') => setMenuForm((p) => ({ ...p, menuType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOLDER">{t('pages.menuManagement.form.folderType')}</SelectItem>
                      <SelectItem value="MENU">{t('pages.menuManagement.form.menuType')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={menuForm.isVisible}
                  onCheckedChange={(checked) => setMenuForm((p) => ({ ...p, isVisible: checked }))}
                />
                <Label>{t('pages.menuManagement.form.visible')}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeMenuDialog}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={menuFormLoading}>
                {menuFormLoading ? t('pages.menuManagement.messages.submitting') : t('common.confirm')}
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
              {t('pages.menuManagement.dialog.permissionTitle', { label: selectedMenuForPermission?.label ?? '-' })}
            </DialogTitle>
            <DialogDescription>
              {t('pages.menuManagement.dialog.permissionDescription', { key: selectedMenuForPermission?.key ?? '-' })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-end mb-4">
              <Button size="sm" onClick={openCreatePermissionDialog}>
                <Plus className="h-4 w-4 mr-1" />
                {t('pages.menuManagement.actions.addPermission')}
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
                {t('pages.menuManagement.messages.noPermissions')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('pages.menuManagement.columns.code')}</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.name')}</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.sortOrder')}</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.buttonType')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
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
              {t('pages.menuManagement.actions.close')}
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
                {permissionFormMode === 'create'
                  ? t('pages.menuManagement.dialog.createPermissionTitle')
                  : t('pages.menuManagement.dialog.editPermissionTitle')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {permissionFormError && (
                <Alert variant="destructive">
                  <AlertDescription>{permissionFormError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>{t('pages.menuManagement.columns.code')}</Label>
                <Input
                  value={permissionForm.code}
                  onChange={(e) => setPermissionForm((p) => ({ ...p, code: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.menuManagement.columns.name')}</Label>
                <Input
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.menuManagement.columns.description')}</Label>
                <Input
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('pages.menuManagement.columns.sortOrder')}</Label>
                  <Input
                    type="number"
                    value={permissionForm.sortOrder}
                    onChange={(e) => setPermissionForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pages.menuManagement.columns.buttonType')}</Label>
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
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={permissionFormLoading}>
                {permissionFormLoading ? t('pages.menuManagement.messages.submitting') : t('common.confirm')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Menu Dialog */}
      <Dialog open={deleteMenuOpen} onOpenChange={setDeleteMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.menuManagement.dialog.deleteMenuTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.menuManagement.dialog.deleteMenuDescription', { label: deleteMenu?.label ?? '-' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMenuOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteMenu} disabled={deleteMenuLoading}>
              {deleteMenuLoading ? t('pages.menuManagement.messages.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      <Dialog open={deletePermissionOpen} onOpenChange={setDeletePermissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.menuManagement.dialog.deletePermissionTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.menuManagement.dialog.deletePermissionDescription', { name: deletePermission?.name ?? '-' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePermissionOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeletePermission} disabled={deletePermissionLoading}>
              {deletePermissionLoading ? t('pages.menuManagement.messages.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
