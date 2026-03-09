import { restClient } from "../rest-client";

/**
 * Command 类型名称映射
 */
export type CommandType =
  // User commands
  | "CreateUserCommand"
  | "UpdateUserCommand"
  | "DeleteUserCommand"
  | "UpdateUserStatusCommand"
  | "ResetPasswordCommand"
  // Role commands
  | "CreateRoleCommand"
  | "UpdateRoleCommand"
  | "DeleteRoleCommand"
  | "AssignUserToRoleCommand"
  | "RemoveUserFromRoleCommand"
  | "AssignRolePermissionsCommand"
  | "UpdateRoleMenusCommand"
  // Menu commands
  | "CreateMenuCommand"
  | "UpdateMenuCommand"
  | "DeleteMenuCommand"
  // Permission commands
  | "CreatePermissionCommand"
  | "UpdatePermissionCommand"
  | "DeletePermissionCommand"
  | "GrantPermissionToRoleCommand"
  | "RevokePermissionFromRoleCommand"
  | "AssignRoleToUserCommand"
  | "RevokeRoleFromUserCommand"
  // Dict category commands
  | "CreateDictCategoryCommand"
  | "UpdateDictCategoryCommand"
  | "DeleteDictCategoryCommand"
  // Dict item commands
  | "CreateDictItemCommand"
  | "UpdateDictItemCommand"
  | "DeleteDictItemCommand";

/**
 * Command 请求结构
 */
export interface CommandRequest<T = unknown> {
  /** Command 类型 */
  type: CommandType;
  /** Command payload */
  payload: T;
}

/**
 * Command 响应结构
 */
export interface CommandResponse<T = unknown> {
  success: boolean;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * 发送 Command
 * @param type Command 类型
 * @param payload Command payload
 * @returns Promise 解析为响应数据
 */
export async function sendCommand<TResponse = unknown, TPayload = unknown>(
  type: CommandType,
  payload: TPayload
): Promise<TResponse> {
  const response = await restClient.post<TResponse>("/commands", {
    type,
    payload,
  });
  return response.data;
}

/**
 * 发送 Command（原始响应）
 * 用于需要访问完整响应信息的场景
 */
export async function sendCommandRaw<TResponse = unknown, TPayload = unknown>(
  type: CommandType,
  payload: TPayload
) {
  return restClient.post<TResponse>("/commands", {
    type,
    payload,
  });
}
