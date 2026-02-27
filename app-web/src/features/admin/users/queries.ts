import type { QueryClient } from '@tanstack/react-query';
import type { QueryParams, PageResponse } from '@/types/table';
import { queryKeys } from '@/lib/queryKeys';
import { type UserItem } from '@/utils/api';
import { graffle } from '@/lib/graffleClient';

export async function fetchUsersPage(
  params: QueryParams,
  searchParams: Record<string, string>,
): Promise<PageResponse<UserItem>> {
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  const where = buildUserFilter(searchParams);
  const orderBy = buildOrderBy(params);

  const result = await graffle.query.users({
    $: { where, orderBy, page, size },
    content: {
      id: true,
      username: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      roles: {
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
    content: result.content as UserItem[],
    totalElements: result.totalElements,
    totalPages: result.totalPages,
    size: result.size,
    number: result.page,
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

