import { useQuery } from "@tanstack/react-query";
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

export function useUsers(options: UseUsersOptions = {}) {
  const { page = 0, size = 20, filters } = options;

  return useQuery<UserConnection, Error>({
    queryKey: [...USERS_QUERY_KEY, { page, size, filters }],
    queryFn: async () => {
      const response = await fetch("/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          query: USERS_QUERY,
          variables: {
            where: filters,
            page,
            size,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "获取用户列表失败");
      }

      return result.data.users;
    },
  });
}
