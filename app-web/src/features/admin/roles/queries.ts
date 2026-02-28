import type { QueryClient } from '@tanstack/react-query';
import type { QueryParams, PageResponse } from '@/types/table';
import { queryKeys } from '@/lib/queryKeys';
import { type RoleItem } from '@/utils/api';
import { graphqlClient } from '@/lib/graphqlClient';

const ROLES_FRAGMENT = `
  id
  code
  name
  description
  permissions {
    id
    code
    name
  }
`;

export async function fetchRolesPage(
  params: QueryParams,
  searchParams: Record<string, string>,
): Promise<PageResponse<RoleItem>> {
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  const where = buildRoleFilter(searchParams);
  const orderBy = buildOrderBy(params);

  const query = `
    query Roles($where: RoleFilter, $orderBy: [OrderByInput], $page: Int, $size: Int) {
      roles(where: $where, orderBy: $orderBy, page: $page, size: $size) {
        content { ${ROLES_FRAGMENT} }
        totalElements
        totalPages
        page
        size
      }
    }
  `;

  const result = await graphqlClient.request<{
    roles: {
      content: RoleItem[];
      totalElements: number;
      totalPages: number;
      page: number;
      size: number;
    };
  }>(query, { where, orderBy, page, size });

  return {
    content: result.roles.content,
    totalElements: result.roles.totalElements,
    totalPages: result.roles.totalPages,
    size: result.roles.size,
    number: result.roles.page,
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
