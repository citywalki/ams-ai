/**
 * GraphQL Query Hook Template
 *
 * Use this template when creating new query hooks that fetch data via GraphQL.
 * Queries (read operations) MUST use GraphQL with urql client.
 *
 * @template {FeatureName} - Replace with your feature name (e.g., "Alarm", "Role")
 * @see CLAUDE.md - API Protocol Selection section
 * @see use-users.ts - Real implementation example
 */

import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/shared/api/graphql";

// =============================================================================
// 1. GRAPHQL QUERY DEFINITION
// =============================================================================

/**
 * GraphQL query string for fetching {FeatureName} data.
 *
 * Naming convention: Use PascalCase for query name (e.g., GetUsers, GetAlarms)
 * Include all fields your components need - GraphQL allows precise field selection
 */
const {FEATURE_NAME}_QUERY = `
  query Get{FeatureNamePlural}($where: {FeatureName}Filter, $page: Int, $size: Int) {
    {featureNamePlural}(where: $where, page: $page, size: $size) {
      content {
        id
        name
        description
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

// =============================================================================
// 2. QUERY KEY DEFINITION
// =============================================================================

/**
 * Query key for {FeatureName} data - used for cache invalidation.
 *
 * Export this constant so mutation hooks can invalidate the cache.
 * Format: ["{entity}", "{action}"] or ["{entity}"] for base key
 */
export const {FEATURE_NAME}_QUERY_KEY = ["{featureName}"] as const;

// =============================================================================
// 3. TYPE DEFINITIONS
// =============================================================================

/**
 * Interface for hook options - define all query parameters here.
 */
interface Use{FeatureName}Options {
  page?: number;
  size?: number;
  filters?: {FeatureName}FilterInput;
}

/**
 * Interface for GraphQL response structure.
 * Must match the shape of your GraphQL query return type.
 */
interface {FeatureName}Response {
  {featureNamePlural}: {FeatureName}Connection;
}

// =============================================================================
// 4. HOOK IMPLEMENTATION
// =============================================================================

/**
 * Hook for fetching {FeatureName} data via GraphQL.
 *
 * @param options - Query options including pagination and filters
 * @returns TanStack Query result with {FeatureName} connection data
 *
 * @example
 * ```tsx
 * function {FeatureName}List() {
 *   const { data, isLoading, error } = use{FeatureNamePlural}({
 *     page: 0,
 *     size: 20,
 *     filters: { status: "ACTIVE" }
 *   });
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <DataTable
 *       data={data?.content || []}
 *       total={data?.totalElements || 0}
 *     />
 *   );
 * }
 * ```
 */
export function use{FeatureNamePlural}(options: Use{FeatureName}Options = {}) {
  const { page = 0, size = 20, filters } = options;

  const query = useQuery<{FeatureName}Connection, Error>({
    // Include all query parameters in the key for proper cache invalidation
    queryKey: [...{FEATURE_NAME}_QUERY_KEY, { page, size, filters }],
    queryFn: async () => {
      const data = await graphql<{FeatureName}Response>({FEATURE_NAME}_QUERY, {
        where: filters,
        page,
        size,
      });
      return data.{featureNamePlural};
    },
  });

  return {
    ...query,
    // Combine loading and fetching states for consistent UI behavior
    isLoading: query.isLoading || query.isFetching,
  };
}

// =============================================================================
// 5. SINGLE ITEM QUERY (Optional)
// =============================================================================

/**
 * GraphQL query for fetching a single {FeatureName} by ID.
 */
const {FEATURE_NAME}_BY_ID_QUERY = `
  query Get{FeatureName}ById($id: ID!) {
    {featureName}(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

/**
 * Hook for fetching a single {FeatureName} by ID.
 *
 * @param id - The {FeatureName} ID (pass undefined to skip the query)
 * @returns TanStack Query result with single {FeatureName} data
 *
 * @example
 * ```tsx
 * function {FeatureName}Detail({ id }: { id: number }) {
 *   const { data, isLoading } = use{FeatureName}(id);
 *
 *   if (isLoading) return <Loading />;
 *   if (!data) return <NotFound />;
 *
 *   return <{FeatureName}Card data={data} />;
 * }
 * ```
 */
export function use{FeatureName}(id: number | undefined) {
  return useQuery<{FeatureName}, Error>({
    queryKey: [...{FEATURE_NAME}_QUERY_KEY, "detail", id],
    queryFn: async () => {
      const data = await graphql<{ featureName: {FeatureName} }>(
        {FEATURE_NAME}_BY_ID_QUERY,
        { id }
      );
      return data.{featureName};
    },
    // Skip query if no ID provided
    enabled: !!id,
  });
}

// =============================================================================
// ERROR HANDLING NOTES
// =============================================================================

/**
 * Error handling is automatically managed by the graphql client:
 * - GraphQL errors: Displayed via toast notification (except 401)
 * - Network errors: Thrown as Error with message
 * - 401 Unauthorized: Handled by auth flow (redirect to login)
 *
 * DO NOT add try-catch here - let errors propagate to TanStack Query's error state.
 */

// =============================================================================
// CACHING NOTES
// =============================================================================

/**
 * Cache behavior:
 * - feature-admin queries: Use `staleTime: 0` (no caching, always fresh)
 * - feature-core queries: Can use default caching behavior
 * - Mutations should invalidate this query key on success
 *
 * Example for no-cache (admin features):
 * ```typescript
 * const query = useQuery<...>({
 *   queryKey: [...],
 *   queryFn: ...,
 *   staleTime: 0,
 *   gcTime: 0,
 * });
 * ```
 */
