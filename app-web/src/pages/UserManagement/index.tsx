import { useState } from "react"";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserList } from "@/features/user/components/user-list";
import { UserForm } from "@/features/user/components/user-form";
import { DeleteUserDialog } from "@/features/user/components/delete-user-dialog";
import { ResetPasswordDialog } from "@/features/user/components/reset-password-dialog";
import { useUsers } from "@/features/user/hooks/use-users";
import {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useResetPassword,
} from "@/features/user/hooks/use-user-mutations";
import type { User, UserFilterInput } from "@/features/user/schema/user";

// 简单检查当前用户是否有管理员权限
function useCanManageUsers(): boolean {
  // TODO: 从 auth store 或用户信息中获取角色
  // 目前暂时返回 true，后续根据实际权限系统调整
  return true;
}

export default function UserManagementPage() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);

  const canManageUsers = useCanManageUsers();

  // 构建过滤器
  const filters: UserFilterInput = {};
  if (searchText) {
    filters.username = { contains: searchText };
  }
  if (statusFilter) {
    filters.status = { equals: statusFilter };
  }

  const { data, isLoading, error } = useUsers({
    page,
    size: pageSize,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetPassword();

  const handleCreate = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const handleFormSubmit = async (formData: {
    username: string;
    email: string;
    password?: string;
    status: "ACTIVE" | "INACTIVE";
  }) => {
    try {
      if (selectedUser) {
        await updateUser.mutateAsync({
          id: selectedUser.id,
          input: {
            username: formData.username,
            email: formData.email,
            status: formData.status,
          },
        });
        toast.success("用户更新成功");
      } else {
        await createUser.mutateAsync({
          username: formData.username,
          email: formData.email,
          password: formData.password!,
          status: formData.status,
        });
        toast.success("用户创建成功");
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(selectedUser ? "更新用户失败" : "创建用户失败");
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser.mutateAsync(selectedUser.id);
      toast.success("用户删除成功");
      setIsDeleteDialogOpen(false);
    } catch (err) {
      toast.error("删除用户失败");
      console.error(err);
    }
  };

  const handleConfirmResetPassword = async (newPassword: string) => {
    if (!selectedUser) return;
    try {
      await resetPassword.mutateAsync({
        id: selectedUser.id,
        newPassword,
      });
      toast.success("密码重置成功");
      setIsResetPasswordDialogOpen(false);
    } catch (err) {
      toast.error("密码重置失败");
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">加载用户列表失败: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>用户管理</CardTitle>
          {canManageUsers && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              创建用户
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 筛选栏 */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索用户名"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="ACTIVE">启用</SelectItem>
                <SelectItem value="INACTIVE">禁用</SelectItem>
                <SelectItem value="LOCKED">锁定</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 用户列表 */}
          <UserList
            users={data?.content || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
            canManageUsers={canManageUsers}
          />

          {/* 分页 */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-500">
                共 {data.totalElements} 条记录，第 {page + 1} / {data.totalPages} 页
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                  disabled={page >= data.totalPages - 1}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 表单对话框 */}
      <UserForm
        user={selectedUser}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={createUser.isPending || updateUser.isPending}
      />

      {/* 删除确认对话框 */}
      <DeleteUserDialog
        user={selectedUser}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteUser.isPending}
      />

      {/* 重置密码对话框 */}
      <ResetPasswordDialog
        user={selectedUser}
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
        onConfirm={handleConfirmResetPassword}
        isLoading={resetPassword.isPending}
      />
    </div>
  );
}
