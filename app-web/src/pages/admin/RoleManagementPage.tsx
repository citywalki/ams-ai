import {useCallback, useEffect, useState} from 'react';
import {ChevronDown, ChevronRight, FileText, Folder, FolderOpen, Menu, Pencil, Plus, RotateCcw, Search, Trash2,} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {ColumnDef} from '@tanstack/react-table';
import {useQueryClient} from '@tanstack/react-query';
import {DataTable} from '@/components/tables/DataTable';
import { queryKeys } from '@/lib/queryKeys';
import { fetchRolesPage, invalidateRoleList } from '@/features/admin/roles/queries';
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');

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

  const handleSearch = () => {
    setQueryKeyword(searchKeyword.trim());
  };

  const handleReset = () => {
    setSearchKeyword('');
    setQueryKeyword('');
  };

  const refreshData = useCallback(() => {
    void invalidateRoleList(queryClient);
  }, [queryClient]);

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
      refreshData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('pages.roleManagement.messages.operationFailed'));
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
        systemApi.getRoleMenus(role.id),
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
        editingRoleForMenu.id,
        Array.from(selectedMenuIds)
      );
      closeMenuDialog();
      refreshData();
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
      refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const togglePermission = (permId: string) => {
    setFormState((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter((id) => id !== permId)
        : [...prev.permissionIds, permId],
    }));
  };

  const columns: ColumnDef<RoleItem>[] = [
    {
      accessorKey: 'code',
      header: t('pages.roleManagement.columns.code'),
      cell: ({ row }) => <span className="font-mono">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: t('pages.roleManagement.columns.name'),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'description',
      header: t('pages.roleManagement.columns.description'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.description || '-'}</span>
      ),
    },
    {
      accessorKey: 'permissions',
      header: t('pages.roleManagement.columns.permissions'),
      cell: ({ row }) => {
        const count = row.original.permissionIds?.length ?? row.original.permissions?.length ?? 0;
        return <Badge variant="secondary">{t('pages.roleManagement.columns.permissionsCount', { count })}</Badge>;
      },
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex justify-start gap-2">
          <Button
            variant="ghost"
            size="sm"
            title={t('pages.roleManagement.actions.associateMenus')}
            onClick={() => openMenuDialog(row.original)}
          >
            <Menu className="h-4 w-4" />
          </Button>
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
            onClick={() => openDeleteDialog(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const searchParams: Record<string, string> = {};
  if (queryKeyword) searchParams.keyword = queryKeyword;

  return (
    <div className="h-full min-h-0 flex flex-col gap-6">
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle>{t('pages.roleManagement.title')}</CardTitle>
          <CardDescription>{t('pages.roleManagement.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label>{t('pages.roleManagement.form.keyword')}</Label>
              <Input
                placeholder={t('pages.roleManagement.form.keywordPlaceholder')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
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
          <CardTitle>{t('pages.roleManagement.listTitle')}</CardTitle>
          <Button variant="ghost" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {t('common.add')}
          </Button>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            queryKey={queryKeys.roles.list(searchParams)}
            queryFn={(params) => fetchRolesPage(params, searchParams)}
            defaultSort={{ id: 'createdAt', desc: true }}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create'
                  ? t('pages.roleManagement.dialog.createTitle')
                  : t('pages.roleManagement.dialog.editTitle')}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'create'
                  ? t('pages.roleManagement.dialog.createDescription')
                  : t('pages.roleManagement.dialog.editDescription')}
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
                  <Label htmlFor="code">{t('pages.roleManagement.form.code')}</Label>
                  <Input
                    id="code"
                    value={formState.code}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder={t('pages.roleManagement.form.codePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t('pages.roleManagement.form.name')}</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={t('pages.roleManagement.form.namePlaceholder')}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('pages.roleManagement.form.description')}</Label>
                <Input
                  id="description"
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={t('pages.roleManagement.form.descriptionPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.roleManagement.form.permissions')}</Label>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  {permissions.length === 0 ? (
                    <div className="text-muted-foreground text-sm">{t('pages.roleManagement.messages.noPermissions')}</div>
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
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? t('pages.roleManagement.messages.submitting') : t('common.confirm')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.roleManagement.dialog.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.roleManagement.dialog.deleteDescription', { name: deleteRole?.name ?? '-' })}
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
              {deleteLoading ? t('pages.roleManagement.messages.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Association Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="max-w-lg h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {t('pages.roleManagement.dialog.menuTitle', { name: editingRoleForMenu?.name ?? '-' })}
            </DialogTitle>
            <DialogDescription>
              {t('pages.roleManagement.dialog.menuDescription', { code: editingRoleForMenu?.code ?? '-' })}
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
              <div className="text-center py-8 text-muted-foreground">{t('pages.roleManagement.messages.noMenus')}</div>
            ) : (
              <div className="border rounded-md h-full overflow-y-auto">
                {renderMenuTree(menuTree)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeMenuDialog}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleMenuSave} disabled={menuSaving}>
              {menuSaving ? t('pages.roleManagement.messages.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
