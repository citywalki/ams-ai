import type { QueryClient } from '@tanstack/react-query';
import type { QueryParams, PageResponse } from '@/types/table';
import { queryKeys } from '@/lib/queryKeys';
import { systemApi, type RoleItem } from '@/utils/api';
import { toPageResponse } from '@/features/admin/shared/queryAdapters';

export async function fetchRolesPage(
  params: QueryParams,
  searchParams: Record<string, string>,
): Promise<PageResponse<RoleItem>> {
  const res = await systemApi.getRoles({ ...params, ...searchParams });
  const total = (res.headers?.['x-total-count'] as string | number | undefined)
    ?? (res.headers?.['X-Total-Count'] as string | number | undefined);
  return toPageResponse(res.data, params, total);
}

export function invalidateRoleList(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.roles.listRoot() });
}
