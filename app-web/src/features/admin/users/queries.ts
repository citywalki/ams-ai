import type { QueryClient } from '@tanstack/react-query';
import type { QueryParams, PageResponse } from '@/types/table';
import { queryKeys } from '@/lib/queryKeys';
import { type UserItem } from '@/utils/api';
import { graphqlClient } from '@/lib/graphqlClient';

const USERS_FRAGMENT = `
  id
  username
  email
  status
  createdAt
  updatedAt
  roles {
    id
    code
    name
  }
`;

export async function fetchUsersPage(
  params: QueryParams,
  searchParams: Record<string, string>,
): Promise<PageResponse<UserItem>> {
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  const where = buildUserFilter(searchParams);
  const orderBy = buildOrderBy(params);

  const query = `
    query Users($where: UserFilter, $orderBy: [OrderByInput], $page: Int, $size: Int) {
      users(where: $where, orderBy: $orderBy, page: $page, size: $size) {
        content { ${USERS_FRAGMENT} }
        totalElements
        totalPages
        page
        size
      }
    }
  `;

  const result = await graphqlClient.request<{
    users: {
      content: UserItem[];
      totalElements: number;
      totalPages: number;
      page: number;
      size: number;
    };
  }>(query, { where, orderBy, page, size });

  return {
    content: result.users.content,
    totalElements: result.users.totalElements,
    totalPages: result.users.totalPages,
    size: result.users.size,
    number: result.users.page,
  };
}

function buildUserFilter(searchParams: Record<string, string>) {
  const filter: Record<string, unknown> = {};
  
  if (searchParams.username) {
    filter.username = { _ilike: searchParams.username };
  }
  if (searchParams.email) {
    filter.email = { _ilike: searchParams.email };
  }
  if (searchParams.status) {
    filter.status = { _eq: searchParams.status };
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

function buildOrderBy(params: QueryParams) {
  if (params.sortBy) {
    return [{ field: params.sortBy, direction: params.sortOrder ?? 'ASC' }];
  }
  return undefined;
}

export function invalidateUserList(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.users.listRoot() });
}

export async function fetchAllUsers(): Promise<UserItem[]> {
  const query = `
    query AllUsers {
      users(page: 0, size: 1000) {
        content { ${USERS_FRAGMENT} }
      }
    }
  `;

  const result = await graphqlClient.request<{
    users: { content: UserItem[] };
  }>(query);

  return result.users.content;
}
