import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/shared/api/graphql";
import type { Menu } from "../schema/menu";

export const MENU_QUERY_KEY = ["menus", "user"] as const;

const USER_MENUS_QUERY = `
  query GetUserMenus {
    userMenus {
      id
      key
      label
      route
      parentId
      icon
      sortOrder
      isVisible
      menuType
      rolesAllowed
      tenant
      createdAt
      updatedAt
      children {
        id
        key
        label
        route
        parentId
        icon
        sortOrder
        isVisible
        menuType
        rolesAllowed
        tenant
        createdAt
        updatedAt
        children {
          id
          key
          label
          route
          parentId
          icon
          sortOrder
          isVisible
          menuType
          rolesAllowed
          tenant
          createdAt
          updatedAt
        }
      }
    }
  }
`;

interface UserMenusResponse {
  userMenus: Menu[];
}

export function useUserMenus() {
  return useQuery<Menu[], Error>({
    queryKey: MENU_QUERY_KEY,
    queryFn: async () => {
      const data = await graphql<UserMenusResponse>(USER_MENUS_QUERY);
      return data.userMenus;
    },
    // Admin feature: must not use cache (per CLAUDE.md caching strategy)
    staleTime: 0,
    gcTime: 0,
  });
}
