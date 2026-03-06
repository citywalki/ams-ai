import { useState } from "react";
import { Pencil, Trash2, KeyRound, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "../schema/user";
import { USER_STATUSES } from "../schema/user";

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
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
  canManageUsers,
}: UserListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无用户数据
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>用户名</TableHead>
          <TableHead>邮箱</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>角色</TableHead>
          <TableHead>最后登录</TableHead>
          <TableHead>创建时间</TableHead>
          {canManageUsers && <TableHead className="text-right">操作</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
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
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResetPassword(user)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      重置密码
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(user)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
