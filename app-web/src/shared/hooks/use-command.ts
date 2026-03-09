import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { sendCommand, type CommandType } from "@/shared/api/command";

/**
 * useCommand hook 配置选项
 */
export interface UseCommandOptions<
  TResponse = unknown,
  TError = Error,
  TPayload = unknown,
> extends Omit<
    UseMutationOptions<TResponse, TError, TPayload>,
    "mutationFn"
  > {
  /** Command 类型 */
  commandType: CommandType;
}

/**
 * 通用 Command Mutation Hook
 *
 * @example
 * ```typescript
 * // 在组件中使用
 * const createUser = useCommand<User, Error, CreateUserInput>({
 *   commandType: "CreateUserCommand",
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ["users"] });
 *   },
 * });
 *
 * // 调用
 * createUser.mutate({ username: "admin", email: "admin@example.com", ... });
 * ```
 */
export function useCommand<
  TResponse = unknown,
  TError = Error,
  TPayload = unknown,
>(
  options: UseCommandOptions<TResponse, TError, TPayload>
): UseMutationResult<TResponse, TError, TPayload> {
  const { commandType, ...mutationOptions } = options;

  return useMutation<TResponse, TError, TPayload>({
    mutationFn: (payload: TPayload) =>
      sendCommand<TResponse, TPayload>(commandType, payload),
    ...mutationOptions,
  });
}

/**
 * 批量创建 Command hooks 的辅助函数
 *
 * @example
 * ```typescript
 * // 定义 commands
 * const userCommands = createCommandHooks({
 *   createUser: { commandType: "CreateUserCommand" },
 *   updateUser: { commandType: "UpdateUserCommand" },
 *   deleteUser: { commandType: "DeleteUserCommand" },
 * });
 *
 * // 使用
 * const createUser = userCommands.createUser.useMutation({
 *   onSuccess: () => { ... }
 * });
 * ```
 */
export function createCommandHooks<
  TDefinitions extends Record<
    string,
    { commandType: CommandType }
  >,
>(definitions: TDefinitions) {
  type Hooks = {
    [K in keyof TDefinitions]: <
      TResponse = unknown,
      TError = Error,
      TPayload = unknown,
    >(
      options?: Omit<UseCommandOptions<TResponse, TError, TPayload>, "commandType">
    ) => UseMutationResult<TResponse, TError, TPayload>;
  };

  const hooks = {} as Hooks;

  for (const [key, config] of Object.entries(definitions)) {
    hooks[key as keyof TDefinitions] = ((options = {}) =>
      useCommand({
        commandType: config.commandType,
        ...options,
      })) as Hooks[keyof TDefinitions];
  }

  return hooks;
}
