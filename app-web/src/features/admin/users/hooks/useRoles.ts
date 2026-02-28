import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphqlClient';
import type { RoleOption } from '@/lib/types';

export function useRoles() {
  const { data: roles = [], isLoading } = useQuery<RoleOption[]>({
    queryKey: ['roles', 'all'],
    queryFn: async () => {
      const query = `
        query Roles {
          roles(size: 100) {
            content {
              id
              code
              name
            }
          }
        }
      `;
      const result = await graphqlClient.request<{
        roles: { content: RoleOption[] };
      }>(query);
      return result.roles.content;
    },
    staleTime: 60000,
  });

  return { roles, isLoading };
}
