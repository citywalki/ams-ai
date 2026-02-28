import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { RoleItem, MenuItem } from '@/lib/types';
import { invalidateRoleList } from '../queries';
import { queryKeys } from '@/lib/queryKeys';

export function useRoleMenuDialog() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getChildrenIds = useCallback((menu: MenuItem): string[] => {
    const ids: string[] = [];
    if (menu.children) {
      for (const child of menu.children) {
        ids.push(child.id);
        ids.push(...getChildrenIds(child));
      }
    }
    return ids;
  }, []);

  const getAllDescendantIds = useCallback((menu: MenuItem): string[] => {
    const ids: string[] = [menu.id];
    if (menu.children) {
      for (const child of menu.children) {
        ids.push(...getAllDescendantIds(child));
      }
    }
    return ids;
  }, []);

  const getMenuSelectionState = useCallback((menu: MenuItem): 'all' | 'partial' | 'none' => {
    const childrenIds = getChildrenIds(menu);
    if (childrenIds.length === 0) {
      return selectedMenuIds.has(menu.id) ? 'all' : 'none';
    }
    const selectedCount = childrenIds.filter((id) => selectedMenuIds.has(id)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === childrenIds.length) return 'all';
    return 'partial';
  }, [selectedMenuIds, getChildrenIds]);

  const toggleMenuWithChildren = useCallback((menu: MenuItem) => {
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
  }, [getMenuSelectionState, getAllDescendantIds]);

  const toggleFolderExpand = useCallback((menuId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  }, []);

  const openDialog = useCallback(async (role: RoleItem) => {
    setEditingRole(role);
    setLoading(true);
    setDialogOpen(true);
    setError(null);
    try {
      const [treeRes, roleMenusRes] = await Promise.all([
        apiClient.get<MenuItem[]>('/system/menus/tree'),
        apiClient.get<{ menuIds: string[] }>(`/system/roles/${role.id}/menus`),
      ]);
      setMenuTree(treeRes.data);
      const menuIds = roleMenusRes.data.menuIds || [];
      setSelectedMenuIds(new Set(menuIds.map(String)));
    } catch (err) {
      console.error('Failed to load menu data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingRole(null);
    setMenuTree([]);
    setSelectedMenuIds(new Set());
    setExpandedFolders(new Set());
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingRole) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.put(`/system/roles/${editingRole.id}/menus`, { menuIds: Array.from(selectedMenuIds) });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.menus(editingRole.id) });
      closeDialog();
      void invalidateRoleList(queryClient);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('pages.roleManagement.messages.saveFailed')
      );
    } finally {
      setSaving(false);
    }
  }, [editingRole, selectedMenuIds, closeDialog, queryClient, t]);

  return {
    dialogOpen,
    editingRole,
    menuTree,
    selectedMenuIds,
    expandedFolders,
    loading,
    saving,
    error,
    openDialog,
    closeDialog,
    handleSave,
    getMenuSelectionState,
    toggleMenuWithChildren,
    toggleFolderExpand,
    setDialogOpen,
  };
}
