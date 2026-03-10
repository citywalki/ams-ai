import { useQueryClient } from "@tanstack/react-query";
import { useCommand } from "@/shared/hooks/use-command";
import type { CreateUserInput, UpdateUserInput, User } from "../schema/user";
import { USERS_QUERY_KEY } from "./use-users";

/**
 * 创建用户 - 使用通用 useCommand
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useCommand<User, Error, CreateUserInput>({
    commandType: "CreateUserCommand",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

/**
 * 更新用户 - 使用通用 useCommand
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useCommand<User, Error, { id: number } & UpdateUserInput>({
    commandType: "UpdateUserCommand",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

/**
 * 删除用户 - 使用通用 useCommand
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useCommand<void, Error, { id: number }>({
    commandType: "DeleteUserCommand",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

/**
 * 重置密码 - 使用通用 useCommand
 */
export function useResetPassword() {
  return useCommand<void, Error, { id: number; newPassword: string }>({
    commandType: "ResetPasswordCommand",
  });
}

/**
 * 更新用户状态 - 使用通用 useCommand
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useCommand<void, Error, { id: number; status: string }>({
    commandType: "UpdateUserStatusCommand",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

/**
 * 批量创建所有用户相关的 command hooks
 * 更简洁的使用方式
 */
export const userCommands = {
  useCreateUser: () => {
    const queryClient = useQueryClient();
    return useCommand<User, Error, CreateUserInput>({
      commandType: "CreateUserCommand",
      onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
    });
  },

  useUpdateUser: () => {
    const queryClient = useQueryClient();
    return useCommand<User, Error, { id: number } & UpdateUserInput>({
      commandType: "UpdateUserCommand",
      onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
    });
  },

  useDeleteUser: () => {
    const queryClient = useQueryClient();
    return useCommand<void, Error, { id: number }>({
      commandType: "DeleteUserCommand",
      onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
    });
  },
};
