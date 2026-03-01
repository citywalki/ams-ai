import { useState, useCallback, useEffect } from 'react';
import { type PermissionItem } from '@/lib/types';
import { graphqlClient } from '@/lib/graphqlClient';

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const query = `
        query Permissions {
          permissions(page: 0, size: 1000) {
            content {
              id
              code
              name
              description
            }
          }
        }
      `;
      const result = await graphqlClient.request<{
        permissions: { content: PermissionItem[] };
      }>(query);
      setPermissions(result.permissions.content);
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
