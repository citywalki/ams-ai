import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/shared/api/graphql";
import type { UserConnection, UserFilterInput } from "../schema/user";

const USERS_QUERY = `
  query GetUsers($where: UserFilter, $page: Int, $size: Int) {
    users(where: $where, page: $page, size: $size) {
      content {
        id
        username
        email
        status
        roles {
          id
          code
          name
        }
        lastLoginAt
        createdAt
        updatedAt
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const USERS_QUERY_KEY = ["users"] as const;

interface UseUsersOptions {
  page?: number;
  size?: number;
  filters?: UserFilterInput;
}

interface UsersResponse {
  users: UserConnection;
}

export function useUsers(options: UseUsersOptions = {}) {
  const { page = 0, size = 20, filters } = options;

  const query = useQuery<UserConnection, Error>({
    queryKey: [...USERS_QUERY_KEY, { page, size, filters }],
    queryFn: async () => {
      const data = await graphql<UsersResponse>(USERS_QUERY, {
        where: filters,
        page,
        size,
      });
      return data.users;
    },
  });

  return {
    ...query,
    isLoading: query.isLoading || query.isFetching,
  };
}
