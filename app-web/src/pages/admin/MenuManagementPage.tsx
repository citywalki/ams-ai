import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronRight, FolderOpen, Lock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Alert, Button, Card, Input, Modal, Space, Spin, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { QueryErrorDisplay } from '@/components/common/QueryErrorDisplay';
import type { MenuItem, PermissionItem } from '@/lib/types';
import { useDeleteMenu, useDeletePermission } from '@/features/admin/menus/mutations';
import { fetchFolders, fetchMenuPermissions, fetchMenusByFolder } from '@/features/admin/menus/queries';
import { useMenuForm, usePermissionForm } from '@/features/admin/menus/hooks';
import { MenuDialog, PermissionDialog } from '@/features/admin/menus/components';

export default function MenuManagementPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const deleteMenuMutation = useDeleteMenu();
  const deletePermissionMutation = useDeletePermission();
  const [folders, setFolders] = useState<MenuItem[]>([]);
  const [folderSearch, setFolderSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<'root' | MenuItem>('root');
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [menusLoading, setMenusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [rootMenuCount, setRootMenuCount] = useState(0);

  const menuForm = useMenuForm({
    selectedFolder,
    onSuccess: () => {
      void loadFolders();
      void loadMenus(selectedFolder);
    },
  });

  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedMenuForPermission, setSelectedMenuForPermission] = useState<MenuItem | null>(null);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const permissionForm = usePermissionForm({
    selectedMenu: selectedMenuForPermission,
    onSuccess: (updatedPermissions) => {
      setPermissions(updatedPermissions);
    },
  });

  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState<MenuItem | null>(null);
  const [deletePermissionOpen, setDeletePermissionOpen] = useState(false);
  const [deletePermission, setDeletePermission] = useState<PermissionItem | null>(null);

  const loadFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFolders(queryClient);
      setFolders(data);
      const folderIds = data.filter((item) => item.menuType === 'FOLDER').map((item) => item.id);
      setExpandedFolders(new Set(folderIds));
      const rootMenusData = await fetchMenusByFolder(queryClient, 'root');
      setRootMenuCount(rootMenusData.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pages.menuManagement.messages.loadFoldersFailed'));
    } finally {
      setLoading(false);
    }
  }, [queryClient, t]);

  const loadMenus = useCallback(
    async (folder: 'root' | MenuItem) => {
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
    },
    [queryClient],
  );

  const buildMenuTree = useCallback((menuItems: MenuItem[]): MenuItem[] => {
    const map = new Map<string, MenuItem>();
    menuItems.forEach((item) => {
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
    menuItems.forEach((item) => {
      const node = map.get(item.id);
      if (!node) return;
      if (item.parentId && map.has(item.parentId)) {
        if (!isAncestor(item.id, item.parentId)) {
          const parent = map.get(item.parentId);
          if (!parent) return;
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
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    void loadMenus(selectedFolder);
  }, [selectedFolder, loadMenus]);

  const handleDeleteMenu = async () => {
    if (!deleteMenu) return;
    try {
      await deleteMenuMutation.mutateAsync(deleteMenu.id);
      await fetchFolders(queryClient).then(setFolders);
      setDeleteMenuOpen(false);
      setDeleteMenu(null);
      void loadMenus(selectedFolder);
    } catch (err) {
      console.error(err);
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
    try {
      await deletePermissionMutation.mutateAsync({ id: deletePermission.id, menuId: selectedMenuForPermission.id });
      setDeletePermissionOpen(false);
      setDeletePermission(null);
      const data = await fetchMenuPermissions(queryClient, selectedMenuForPermission.id);
      setPermissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getMenuCountBadge = (folder: MenuItem) => {
    const rawCount = folder.metadata?.menuCount;
    if (typeof rawCount === 'number') return rawCount;
    if (typeof rawCount === 'string') {
      const parsed = Number.parseInt(rawCount, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const filteredFolders = useMemo(
    () =>
      folders.filter((folder) =>
        folderSearch
          ? folder.label.toLowerCase().includes(folderSearch.toLowerCase()) ||
            folder.key.toLowerCase().includes(folderSearch.toLowerCase())
          : true,
      ),
    [folders, folderSearch],
  );

  const treeData = useMemo(() => buildMenuTree(filteredFolders), [buildMenuTree, filteredFolders]);

  const renderTreeItem = (item: MenuItem, level = 0, visited: Set<string> = new Set()): JSX.Element | null => {
    if (level > 20 || visited.has(item.id)) {
      return null;
    }
    visited.add(item.id);

    const isFolder = item.menuType === 'FOLDER';
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = typeof selectedFolder !== 'string' && selectedFolder.id === item.id;

    return (
      <div key={item.id}>
        <div
          className={`group flex cursor-pointer items-center justify-between rounded-md p-2 ${
            isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-[var(--app-color-surface-muted)]'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => setSelectedFolder(item)}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {isFolder && hasChildren ? (
              <ChevronRight
                className={`h-3 w-3 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleFolder(item.id);
                }}
              />
            ) : (
              <div className="h-3 w-3 flex-shrink-0" />
            )}
            <FolderOpen className="h-4 w-4 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm">{item.label}</span>
                {isFolder && <Tag style={{ marginInlineEnd: 0 }}>{getMenuCountBadge(item)}</Tag>}
              </div>
              {item.route && <span className="font-mono text-xs text-[var(--app-color-text-secondary)]">{item.route}</span>}
            </div>
          </div>
          <Space className="hidden group-hover:flex" size={4}>
            <Button
              size="small"
              type="text"
              icon={<Pencil className="h-3 w-3" />}
              onClick={(event) => {
                event.stopPropagation();
                menuForm.openEditDialog(item);
              }}
            />
            <Button
              danger
              size="small"
              type="text"
              icon={<Trash2 className="h-3 w-3" />}
              onClick={(event) => {
                event.stopPropagation();
                setDeleteMenu(item);
                setDeleteMenuOpen(true);
              }}
            />
          </Space>
        </div>
        {isFolder && isExpanded && hasChildren && (
          <div>{item.children?.map((child) => renderTreeItem(child, level + 1, new Set(visited)))}</div>
        )}
      </div>
    );
  };

  const menuColumns: TableProps<MenuItem>['columns'] = [
    {
      title: t('pages.menuManagement.columns.key'),
      dataIndex: 'key',
      key: 'key',
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      title: t('pages.menuManagement.columns.name'),
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: t('pages.menuManagement.columns.route'),
      dataIndex: 'route',
      key: 'route',
      render: (value: string | undefined) => <span className="font-mono text-sm">{value || '-'}</span>,
    },
    {
      title: t('pages.menuManagement.columns.sortOrder'),
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 120,
    },
    {
      title: t('pages.menuManagement.columns.visible'),
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 120,
      render: (visible: boolean) =>
        visible ? (
          <Tag color="green">{t('pages.menuManagement.form.yes')}</Tag>
        ) : (
          <Tag color="default">{t('pages.menuManagement.form.no')}</Tag>
        ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size={4}>
          <Button type="text" icon={<Pencil className="h-4 w-4" />} onClick={() => menuForm.openEditDialog(record)} />
          <Button
            type="text"
            title={t('pages.menuManagement.actions.managePermissions')}
            icon={<Lock className="h-4 w-4" />}
            onClick={() => void openPermissionDialog(record)}
          />
          <Button
            danger
            type="text"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              setDeleteMenu(record);
              setDeleteMenuOpen(true);
            }}
          />
        </Space>
      ),
    },
  ];

  const permissionColumns: TableProps<PermissionItem>['columns'] = [
    {
      title: t('pages.menuManagement.columns.code'),
      dataIndex: 'code',
      key: 'code',
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      title: t('pages.menuManagement.columns.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('pages.menuManagement.columns.sortOrder'),
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 140,
      render: (value: number | null | undefined) => value ?? '-',
    },
    {
      title: t('pages.menuManagement.columns.buttonType'),
      dataIndex: 'buttonType',
      key: 'buttonType',
      width: 180,
      render: (value: string | undefined) => value || '-',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Button type="text" icon={<Pencil className="h-4 w-4" />} onClick={() => permissionForm.openEditDialog(record)} />
          <Button
            danger
            type="text"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              setDeletePermission(record);
              setDeletePermissionOpen(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="flex h-full min-h-0 gap-3">
      <Card
        className="w-[300px] min-h-0 shrink-0"
        title={t('pages.menuManagement.folderTitle')}
        extra={<Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={menuForm.openCreateDialog} />}
      >
        <Input
          allowClear
          placeholder={t('pages.menuManagement.form.searchFolderPlaceholder')}
          prefix={<Search className="h-4 w-4" />}
          value={folderSearch}
          onChange={(event) => setFolderSearch(event.target.value)}
        />
        <div className="mt-3 h-[calc(100vh-290px)] min-h-[320px] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Spin />
            </div>
          ) : error ? (
            <QueryErrorDisplay error={new Error(error)} onRetry={() => void loadFolders()} size="card" />
          ) : (
            <div className="space-y-1">
              <div
                className={`flex cursor-pointer items-center justify-between rounded-md p-2 ${
                  selectedFolder === 'root' ? 'bg-primary/10 text-primary' : 'hover:bg-[var(--app-color-surface-muted)]'
                }`}
                onClick={() => setSelectedFolder('root')}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FolderOpen className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm">{t('pages.menuManagement.rootMenu')}</span>
                </div>
                <Tag style={{ marginInlineEnd: 0 }}>{rootMenuCount}</Tag>
              </div>
              {treeData.map((folder) => renderTreeItem(folder, 0))}
              {filteredFolders.length === 0 && (
                <Typography.Text type="secondary">{t('pages.menuManagement.messages.noFolders')}</Typography.Text>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card
        className="flex-1 min-h-0"
        title={selectedFolder === 'root' ? t('pages.menuManagement.rootMenu') : selectedFolder.label}
        extra={
          <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={menuForm.openCreateDialog}>
            {t('pages.menuManagement.actions.addMenu')}
          </Button>
        }
      >
        {selectedFolder !== 'root' && selectedFolder.route && (
          <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
            {selectedFolder.route}
          </Typography.Paragraph>
        )}
        <div className="h-[calc(100vh-260px)] min-h-[340px] overflow-y-auto">
          <Table<MenuItem>
            rowKey="id"
            loading={menusLoading}
            pagination={false}
            columns={menuColumns}
            dataSource={menus.filter((menu) => menu.menuType !== 'FOLDER')}
            locale={{ emptyText: t('pages.menuManagement.messages.noMenus') }}
          />
        </div>
      </Card>

      <MenuDialog
        open={menuForm.dialogOpen}
        onOpenChange={menuForm.setDialogOpen}
        mode={menuForm.dialogMode}
        form={menuForm.form}
        error={menuForm.formError}
        onClose={menuForm.closeDialog}
        editingMenu={menuForm.editingMenu}
      />

      <Modal
        destroyOnHidden
        open={permissionDialogOpen}
        width={900}
        title={t('pages.menuManagement.dialog.permissionTitle', { label: selectedMenuForPermission?.label ?? '-' })}
        onCancel={() => setPermissionDialogOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPermissionDialogOpen(false)}>
            {t('pages.menuManagement.actions.close')}
          </Button>,
        ]}
      >
        <Typography.Paragraph type="secondary">
          {t('pages.menuManagement.dialog.permissionDescription', { key: selectedMenuForPermission?.key ?? '-' })}
        </Typography.Paragraph>
        <div className="mb-3 flex justify-end">
          <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={permissionForm.openCreateDialog}>
            {t('pages.menuManagement.actions.addPermission')}
          </Button>
        </div>
        <Table<PermissionItem>
          rowKey="id"
          loading={permissionsLoading}
          pagination={false}
          columns={permissionColumns}
          dataSource={permissions}
          locale={{ emptyText: t('pages.menuManagement.messages.noPermissions') }}
        />
      </Modal>

      <PermissionDialog
        open={permissionForm.dialogOpen}
        onOpenChange={permissionForm.setDialogOpen}
        mode={permissionForm.dialogMode}
        form={permissionForm.form}
        error={permissionForm.formError}
        onClose={permissionForm.closeDialog}
      />

      <Modal
        destroyOnHidden
        open={deleteMenuOpen}
        title={t('pages.menuManagement.dialog.deleteMenuTitle')}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true, loading: deleteMenuMutation.isPending }}
        onCancel={() => setDeleteMenuOpen(false)}
        onOk={() => void handleDeleteMenu()}
      >
        <p>{t('pages.menuManagement.dialog.deleteMenuDescription', { label: deleteMenu?.label ?? '-' })}</p>
        {deleteMenuMutation.error && (
          <Alert style={{ marginTop: 12 }} type="error" showIcon message={deleteMenuMutation.error.message} />
        )}
      </Modal>

      <Modal
        destroyOnHidden
        open={deletePermissionOpen}
        title={t('pages.menuManagement.dialog.deletePermissionTitle')}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true, loading: deletePermissionMutation.isPending }}
        onCancel={() => setDeletePermissionOpen(false)}
        onOk={() => void handleDeletePermission()}
      >
        <p>{t('pages.menuManagement.dialog.deletePermissionDescription', { name: deletePermission?.name ?? '-' })}</p>
        {deletePermissionMutation.error && (
          <Alert
            style={{ marginTop: 12 }}
            type="error"
            showIcon
            message={deletePermissionMutation.error.message}
          />
        )}
      </Modal>
    </div>
  );
}
