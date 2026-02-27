import type { QueryClient } from '@tanstack/react-query';
import type { QueryParams, PageResponse } from '@/types/table';
import { queryKeys } from '@/lib/queryKeys';
import { type RoleItem } from '@/utils/api';
import { graffle } from '@/lib/graffleClient';

export async function fetchRolesPage(
  params: QueryParams,
  searchParams: Record<string, string>,
): Promise<PageResponse<RoleItem>> {
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  const where = buildRoleFilter(searchParams);
  const orderBy = buildOrderBy(params);

  const result = await graffle.query.roles({
    $: { where, orderBy, page, size },
    content: {
      id: true,
      code: true,
      name: true,
      description: true,
      permissions: {
        id: true,
        code: true,
        name: true,
      },
    },
    totalElements: true,
    totalPages: true,
    page: true,
    size: true,
  });

  return {
    content: result.content as RoleItem[],
    totalElements: result.totalElements,
    totalPages: result.totalPages,
    size: result.size,
    number: result.page,
  };
}

function buildRoleFilter(searchParams: Record<string, string>) {
  const filter: Record<string, unknown> = {};
  
  if (searchParams.keyword) {
    filter._or = [
      { code: { _ilike: searchParams.keyword } },
      { name: { _ilike: searchParams.keyword } },
    ];
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

function buildOrderBy(params: QueryParams) {
  if (params.sortBy) {
    return [{ field: params.sortBy, direction: params.sortOrder ?? 'ASC' }];
  }
  return undefined;
}

export function invalidateRoleList(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.roles.listRoot() });
}
