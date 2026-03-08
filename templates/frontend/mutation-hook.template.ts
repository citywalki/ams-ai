/**
 * REST Mutation Hook Template
 *
 * Use this template when creating new mutation hooks that modify data via REST.
 * Mutations (write operations) MUST use REST with axios client.
 *
 * @template {FeatureName} - Replace with your feature name (e.g., "Alarm", "Role")
 * @see CLAUDE.md - API Protocol Selection section
 * @see use-user-mutations.ts - Real implementation example
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restClient } from "@/shared/api/rest-client";

// =============================================================================
// 1. IMPORT QUERY KEYS (for cache invalidation)
// =============================================================================

/**
 * Import query keys from the corresponding query hook.
 * This ensures cache is properly invalidated after mutations.
 */
import { {FEATURE_NAME}_QUERY_KEY } from "./use-{featureName}s";

// =============================================================================
// 2. TYPE DEFINITIONS
// =============================================================================

/**
 * Interface for creating a new {FeatureName}.
 * Include all required fields for creation.
 */
interface Create{FeatureName}Input {
  name: string;
  description?: string;
}

/**
 * Interface for updating an existing {FeatureName}.
 * All fields should be optional for partial updates.
 */
interface Update{FeatureName}Input {
  name?: string;
  description?: string;
}

/**
 * Interface for {FeatureName} response data.
 */
interface {FeatureName} {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// 3. CREATE MUTATION
// =============================================================================

/**
 * Hook for creating a new {FeatureName}.
 *
 * Uses POST /{resource} endpoint following REST conventions.
 * Automatically invalidates the query cache on success.
 *
 * @returns TanStack Query mutation with create function
 *
 * @example
 * ```tsx
 * function Create{FeatureName}Form() {
 *   const create{FeatureName} = useCreate{FeatureName}();
 *
 *   const handleSubmit = async (values: Create{FeatureName}Input) => {
 *     try {
 *       await create{FeatureName}.mutateAsync(values);
 *       toast.success("创建成功");
 *       // Cache is automatically invalidated, list will refresh
 *     } catch (error) {
 *       toast.error("创建失败");
 *     }
 *   };
 *
 *   return <Form onSubmit={handleSubmit} />;
 * }
 * ```
 */
export function useCreate{FeatureName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Create{FeatureName}Input) => {
      const response = await restClient.post<{FeatureName}>(
        "/{resource}",
        input
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the list query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: {FEATURE_NAME}_QUERY_KEY });
    },
  });
}

// =============================================================================
// 4. UPDATE MUTATION
// =============================================================================

/**
 * Hook for updating an existing {FeatureName}.
 *
 * Uses PUT /{resource}/:id endpoint for full updates.
 * Use PATCH for partial updates (see useUpdate{FeatureName}Partial below).
 *
 * @returns TanStack Query mutation with update function
 *
 * @example
 * ```tsx
 * function Edit{FeatureName}Form({ id, initialData }: { id: number; initialData: {FeatureName} }) {
 *   const update{FeatureName} = useUpdate{FeatureName}();
 *
 *   const handleSubmit = async (values: Update{FeatureName}Input) => {
 *     try {
 *       await update{FeatureName}.mutateAsync({ id, input: values });
 *       toast.success("更新成功");
 *     } catch (error) {
 *       toast.error("更新失败");
 *     }
 *   };
 *
 *   return <Form initialData={initialData} onSubmit={handleSubmit} />;
 * }
 * ```
 */
export function useUpdate{FeatureName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number;
      input: Update{FeatureName}Input;
    }) => {
      const response = await restClient.put<{FeatureName}>(
        `/{resource}/${id}`,
        input
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: {FEATURE_NAME}_QUERY_KEY });
    },
  });
}

// =============================================================================
// 5. PARTIAL UPDATE MUTATION (PATCH)
// =============================================================================

/**
 * Hook for partially updating an existing {FeatureName}.
 *
 * Uses PATCH /{resource}/:id endpoint for partial updates.
 * Only sends changed fields to the server.
 *
 * @returns TanStack Query mutation with patch function
 */
export function useUpdate{FeatureName}Partial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number;
      input: Partial<Update{FeatureName}Input>;
    }) => {
      const response = await restClient.patch<{FeatureName}>(
        `/{resource}/${id}`,
        input
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: {FEATURE_NAME}_QUERY_KEY });
    },
  });
}

// =============================================================================
// 6. DELETE MUTATION
// =============================================================================

/**
 * Hook for deleting a {FeatureName}.
 *
 * Uses DELETE /{resource}/:id endpoint.
 * Returns void on success (204 No Content).
 *
 * @returns TanStack Query mutation with delete function
 *
 * @example
 * ```tsx
 * function Delete{FeatureName}Button({ id }: { id: number }) {
 *   const delete{FeatureName} = useDelete{FeatureName}();
 *
 *   const handleDelete = async () => {
 *     if (!confirm("确定要删除吗？")) return;
 *
 *     try {
 *       await delete{FeatureName}.mutateAsync(id);
 *       toast.success("删除成功");
 *     } catch (error) {
 *       toast.error("删除失败");
 *     }
 *   };
 *
 *   return <Button onClick={handleDelete}>删除</Button>;
 * }
 * ```
 */
export function useDelete{FeatureName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await restClient.delete(`/{resource}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: {FEATURE_NAME}_QUERY_KEY });
    },
  });
}

// =============================================================================
// 7. CUSTOM ACTION MUTATION (Example)
// =============================================================================

/**
 * Example: Custom action that doesn't fit standard CRUD pattern.
 *
 * For actions like "activate", "approve", "reset-password", etc.
 * Use PUT or POST to a sub-resource endpoint.
 */
export function use{FeatureName}Action() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: number;
      action: "activate" | "deactivate";
    }) => {
      const response = await restClient.put<{FeatureName}>(
        `/{resource}/${id}/${action}`,
        {}
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: {FEATURE_NAME}_QUERY_KEY });
    },
  });
}

// =============================================================================
// ERROR HANDLING NOTES
// =============================================================================

/**
 * Error handling is automatically managed by the restClient interceptors:
 * - 400 Bad Request: Validation errors, displayed via toast
 * - 401 Unauthorized: Token refresh or redirect to login
 * - 403 Forbidden: Permission denied
 * - 404 Not Found: Resource doesn't exist
 * - 500 Server Error: Generic error message
 *
 * DO NOT add try-catch in mutationFn - let errors propagate.
 * Handle errors in the component using try-catch around mutateAsync.
 */

// =============================================================================
// HTTP METHOD GUIDELINES
// =============================================================================

/**
 * REST Method Selection:
 *
 * | Method | Use Case | Endpoint Pattern |
 * |--------|----------|------------------|
 * | POST   | Create new resource | POST /{resource} |
 * | PUT    | Full update (replace) | PUT /{resource}/:id |
 * | PATCH  | Partial update | PATCH /{resource}/:id |
 * | DELETE | Remove resource | DELETE /{resource}/:id |
 *
 * Status Codes:
 * - 201 Created: Resource created successfully
 * - 200 OK: Update completed with response body
 * - 204 No Content: Update/delete completed, no response body
 * - 400 Bad Request: Validation error
 * - 404 Not Found: Resource not found
 */

// =============================================================================
// CACHE INVALIDATION NOTES
// =============================================================================

/**
 * Always invalidate related queries on mutation success:
 *
 * 1. List queries: Invalidate the base query key
 *    queryClient.invalidateQueries({ queryKey: {FEATURE_NAME}_QUERY_KEY });
 *
 * 2. Detail queries: Invalidate specific item
 *    queryClient.invalidateQueries({ queryKey: [...{FEATURE_NAME}_QUERY_KEY, "detail", id] });
 *
 * 3. Multiple related resources: Invalidate all affected keys
 *    queryClient.invalidateQueries({ queryKey: ["users"] });
 *    queryClient.invalidateQueries({ queryKey: ["roles"] });
 *
 * 4. Exact invalidation (if needed):
 *    queryClient.invalidateQueries({
 *      queryKey: {FEATURE_NAME}_QUERY_KEY,
 *      exact: true  // Only invalidate exact key match
 *    });
 */
