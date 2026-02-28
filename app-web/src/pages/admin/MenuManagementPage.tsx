import {useCallback, useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {ChevronRight, FolderOpen, Lock, Pencil, Plus, Search, Trash2} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
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
import {QueryErrorDisplay} from '@/components/common/QueryErrorDisplay';
import {menuApi, type MenuItem, type PermissionItem} from '@/utils/api';
import {fetchFolders, fetchMenuPermissions, fetchMenusByFolder,} from '@/features/admin/menus/queries';
import {useMenuForm, usePermissionForm} from '@/features/admin/menus/hooks';
import {MenuDialog, PermissionDialog} from '@/features/admin/menus/components';

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
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [rootMenuCount, setRootMenuCount] = useState(0);

  // Menu form hook
  const menuForm = useMenuForm({
    selectedFolder,
    onSuccess: () => {
      void loadFolders();
      void loadMenus(selectedFolder);
    },
  });

  // Permission management state
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedMenuForPermission, setSelectedMenuForPermission] = useState<MenuItem | null>(null);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  // Permission form hook
  const permissionForm = usePermissionForm({
    selectedMenu: selectedMenuForPermission,
    onSuccess: (updatedPermissions) => {
      setPermissions(updatedPermissions);
    },
  });

  // Delete menu state
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState<MenuItem | null>(null);
  const [deleteMenuLoading, setDeleteMenuLoading] = useState(false);

  // Delete permission state
  const [deletePermissionOpen, setDeletePermissionOpen] = useState(false);
  const [deletePermission, setDeletePermission] = useState<PermissionItem | null>(null);
  const [deletePermissionLoading, setDeletePermissionLoading] = useState(false);

  const loadFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFolders(queryClient);
      setFolders(data);
      const folderIds = data.filter(item => item.menuType === 'FOLDER').map(item => item.id);
      setExpandedFolders(new Set(folderIds));
      const rootMenusData = await fetchMenusByFolder(queryClient, 'root');
      setRootMenuCount(rootMenusData.length);
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

  const buildMenuTree = useCallback((menuItems: MenuItem[]): MenuItem[] => {
    const map = new Map<string, MenuItem>();
    menuItems.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    const isAncestor = (nodeId: string, potentialAncestorId: string): boolean => {
      let currentId: string | undefined = potentialAncestorId;
      const seen = new Set<string>();
      while (currentId) {
        if (currentId === nodeId) return true;
        if (seen.has(currentId)) break;
        seen.add(currentId);
        currentId = map.get(currentId)?.parentId;
      }
      return false;
    };

    const rootItems: MenuItem[] = [];
    menuItems.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        if (!isAncestor(item.id, item.parentId)) {
          const parent = map.get(item.parentId)!;
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        } else {
          rootItems.push(node);
        }
      } else {
        rootItems.push(node);
      }
    });

    return rootItems;
  }, []);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderTreeItem = (item: MenuItem, level: number = 0, visited: Set<string> = new Set()): JSX.Element | null => {
    if (level > 20 || visited.has(item.id)) {
      return null;
    }
    visited.add(item.id);
    const isFolder = item.menuType === 'FOLDER';
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = typeof selectedFolder !== 'string' && selectedFolder?.id === item.id;

    const handleClick = () => {
      selectFolder(item);
    };

    return (
      <div key={item.id}>
        <div
          className={`flex items-center justify-between p-2 rounded-md cursor-pointer group ${
            isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={handleClick}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isFolder && hasChildren ? (
              <ChevronRight
                className={`h-3 w-3 flex-shrink-0 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(item.id);
                }}
              />
            ) : (
              <div className="w-3 h-3 flex-shrink-0" />
            )}
            <FolderOpen className="h-4 w-4 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                      <span className="truncate text-sm">{item.label}</span>
                      {isFolder && (
                          <Badge variant="secondary" className="text-xs">
                              {getMenuCountBadge(item)}
                          </Badge>
                      )}
                  </div>
                  {item.route && (
                      <span className="text-xs text-muted-foreground truncate font-mono">{item.route}</span>
                  )}
              </div>
          </div>
          <div className="hidden group-hover:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                menuForm.openEditDialog(item);
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
                setDeleteMenu(item);
                setDeleteMenuOpen(true);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {isFolder && isExpanded && hasChildren && (
          <div className="space-y-1">
            {item.children!.map(child => renderTreeItem(child, level + 1, visited))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    void loadMenus(selectedFolder);
  }, [selectedFolder, loadMenus]);

  const selectFolder = (folder: 'root' | MenuItem) => {
    setSelectedFolder(folder);
  };

  const handleDeleteMenu = async () => {
    if (!deleteMenu) return;
    setDeleteMenuLoading(true);
    try {
      await menuApi.deleteMenu(deleteMenu.id);
      await fetchFolders(queryClient).then(setFolders);
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

  const handleDeletePermission = async () => {
    if (!deletePermission || !selectedMenuForPermission) return;
    setDeletePermissionLoading(true);
    try {
      await menuApi.deletePermission(deletePermission.id);
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
    <div className="h-full min-h-0 flex gap-2">
      <Card className="w-[280px] min-h-0 flex-shrink-0 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('pages.menuManagement.folderTitle')}</CardTitle>
            <Button size="sm" onClick={menuForm.openCreateDialog}>
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
            <QueryErrorDisplay error={new Error(error)} onRetry={() => void loadFolders()} size="card" />
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
                    <Badge variant="secondary" className="text-xs">
                      {rootMenuCount}
                    </Badge>
                  </div>
                </div>
                {(() => {
                  const filteredFolders = folders.filter((f) =>
                    folderSearch
                      ? f.label.toLowerCase().includes(folderSearch.toLowerCase()) ||
                        f.key.toLowerCase().includes(folderSearch.toLowerCase())
                      : true
                  );
                  const treeData = buildMenuTree(filteredFolders);
                  return treeData.map(folder => renderTreeItem(folder, 0));
                })()}
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
            <Button size="sm" onClick={menuForm.openCreateDialog}>
              <Plus className="h-4 w-4 mr-1"/>
              {t('pages.menuManagement.actions.addMenu')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('pages.menuManagement.columns.key')}</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.name')}</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.route')}</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.sortOrder')}</TableHead>
                    <TableHead>{t('pages.menuManagement.columns.visible')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menusLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {t('common.loading')}
                      </TableCell>
                    </TableRow>
                  ) : menus.filter(menu => menu.menuType !== 'FOLDER').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {t('pages.menuManagement.messages.noMenus')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    menus.filter(menu => menu.menuType !== 'FOLDER').map((menu) => (
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
                              onClick={() => menuForm.openEditDialog(menu)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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
                              onClick={() => {
                                setDeleteMenu(menu);
                                setDeleteMenuOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Menu Dialog */}
      <MenuDialog
        open={menuForm.dialogOpen}
        onOpenChange={menuForm.setDialogOpen}
        mode={menuForm.dialogMode}
        form={menuForm.form}
        error={menuForm.formError}
        onClose={menuForm.closeDialog}
        editingMenu={menuForm.editingMenu}
      />

      {/* Permission List Dialog */}
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
              <Button size="sm" onClick={permissionForm.openCreateDialog}>
                <Plus className="h-4 w-4 mr-1" />
                {t('pages.menuManagement.actions.addPermission')}
              </Button>
            </div>
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
                {permissionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {t('common.loading')}
                    </TableCell>
                  </TableRow>
                ) : permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {t('pages.menuManagement.messages.noPermissions')}
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => (
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
                            onClick={() => permissionForm.openEditDialog(permission)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletePermission(permission);
                              setDeletePermissionOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>
              {t('pages.menuManagement.actions.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Form Dialog */}
      <PermissionDialog
        open={permissionForm.dialogOpen}
        onOpenChange={permissionForm.setDialogOpen}
        mode={permissionForm.dialogMode}
        form={permissionForm.form}
        error={permissionForm.formError}
        onClose={permissionForm.closeDialog}
      />

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
