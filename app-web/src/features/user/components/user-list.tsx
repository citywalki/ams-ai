import { Pencil, Trash2, KeyRound, Ban, CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "../schema/user";
import { USER_STATUSES } from "../schema/user";

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
  onToggleStatus: (user: User) => void;
  canManageUsers: boolean;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-CN");
}

function getStatusBadge(status: string) {
  const statusConfig = USER_STATUSES.find((s) => s.value === status);
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-800 hover:bg-green-100",
    gray: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    red: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  return (
    <Badge className={colorMap[statusConfig?.color || "gray"]}>
      {statusConfig?.label || status}
    </Badge>
  );
}

export function UserList({
  users,
  isLoading,
  onEdit,
  onDelete,
  onResetPassword,
  onToggleStatus,
  canManageUsers,
}: UserListProps) {
  return (
    <Table className="border">
      <TableHeader>
        <TableRow>
          <TableHead>用户名</TableHead>
          <TableHead>邮箱</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>角色</TableHead>
          <TableHead>最后登录</TableHead>
          <TableHead>创建时间</TableHead>
          {canManageUsers && <TableHead>操作</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell
              colSpan={canManageUsers ? 7 : 6}
              className="text-center py-12"
            >
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">加载中...</p>
            </TableCell>
          </TableRow>
        ) : users.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={canManageUsers ? 7 : 6}
              className="text-center py-12 text-gray-500"
            >
              暂无用户数据
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.roles?.map((role) => (
                    <Badge key={role.id} variant="outline" className="text-xs">
                      {role.name}
                    </Badge>
                  )) || "-"}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(user.lastLoginAt)}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(user.createdAt)}
              </TableCell>
              {canManageUsers && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      title="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(user)}
                      title={user.status === "ACTIVE" ? "禁用" : "启用"}
                      className={
                        user.status === "ACTIVE"
                          ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          : "text-green-600 hover:text-green-700 hover:bg-green-50"
                      }
                    >
                      {user.status === "ACTIVE" ? (
                        <Ban className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResetPassword(user)}
                      title="重置密码"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
