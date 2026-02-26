import { useState, useCallback, useEffect } from 'react';
import { systemApi, type PermissionItem } from '@/utils/api';

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await systemApi.getPermissions();
      const permList = Array.isArray(res.data)
        ? res.data
        : (res.data.content ?? res.data.items ?? []);
      setPermissions(permList);
    } catch {
      console.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    reload: loadPermissions,
  };
}
