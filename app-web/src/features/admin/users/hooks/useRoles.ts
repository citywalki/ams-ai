import { useState, useCallback, useEffect } from 'react';
import { systemApi, type RoleOption } from '@/utils/api';

export function useRoles() {
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const loadRoles = useCallback(async () => {
    try {
      const res = await systemApi.getRoles();
      const roleList = Array.isArray(res.data)
        ? res.data
        : (res.data.content ?? res.data.items ?? []);
      setRoles(roleList);
    } catch {
      console.error('Failed to load roles');
    }
  }, []);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  return { roles, loadRoles };
}
