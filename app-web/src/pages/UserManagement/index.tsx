import { useState } from "react";
import { Plus, Search, RotateCcw, Loader2, RefreshCw } from "lucide-react";
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
import { ToggleStatusDialog } from "@/features/user/components/toggle-status-dialog";
import { useUsers } from "@/features/user/hooks/use-users";
import {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useResetPassword,
  useUpdateUserStatus,
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
  const [appliedFilters, setAppliedFilters] = useState<UserFilterInput | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] = useState(false);

  const canManageUsers = useCanManageUsers();

  const { data, isLoading, refetch } = useUsers({
    page,
    size: pageSize,
    filters: appliedFilters,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetPassword();
  const toggleStatus = useUpdateUserStatus();

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

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setIsToggleStatusDialogOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const actionText = newStatus === "ACTIVE" ? "启用" : "禁用";
    try {
      await toggleStatus.mutateAsync({
        id: selectedUser.id,
        status: newStatus,
      });
      toast.success(`用户${actionText}成功`);
      setIsToggleStatusDialogOpen(false);
    } catch (err) {
      toast.error(`用户${actionText}失败`);
      console.error(err);
    }
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

  const handleResetFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setAppliedFilters(undefined);
    setPage(0);
  };

  const handleRefresh = async () => {
    const filters: UserFilterInput = {};
    if (searchText) {
      filters.username = { _ilike: `%${searchText}%` };
    }
    if (statusFilter) {
      filters.status = { _eq: statusFilter };
    }
    const newFilters = Object.keys(filters).length > 0 ? filters : undefined;

    // 如果筛选条件没变且页码已经是第一页，直接强制刷新
    if (JSON.stringify(newFilters) === JSON.stringify(appliedFilters) && page === 0) {
      await refetch();
    } else {
      // 否则更新筛选条件和页码
      setAppliedFilters(newFilters);
      setPage(0);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 所有内容放在一个卡片内 */}
      <Card className="flex-1 flex flex-col min-h-0">
        {/* 卡片头部：标题 */}
        <CardHeader className="pb-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-[#32363A]">用户管理</CardTitle>
            <p className="text-sm text-[#6A6D70]">管理系统用户账户</p>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
          {/* 过滤条件 */}
          <div className="pb-4 border-b">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索用户名"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="ACTIVE">启用</SelectItem>
                  <SelectItem value="INACTIVE">禁用</SelectItem>
                  <SelectItem value="LOCKED">锁定</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                刷新
              </Button>
              <Button variant="outline" onClick={handleResetFilters} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                重置
              </Button>
            </div>
          </div>

          {/* 创建按钮 - 分割线下方的右侧 */}
          {canManageUsers && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                创建用户
              </Button>
            </div>
          )}

          {/* 表格数据 */}
          <div className="flex-1 overflow-auto min-h-0 py-4">
            <UserList
              users={data?.content || []}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onResetPassword={handleResetPassword}
              onToggleStatus={handleToggleStatus}
              canManageUsers={canManageUsers}
            />
          </div>

          {/* 分页 */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                共 {data.totalElements} 条记录，第 {page + 1} / {data.totalPages} 页
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "上一页"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                  disabled={page >= data.totalPages - 1 || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "下一页"}
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

      {/* 切换状态确认对话框 */}
      <ToggleStatusDialog
        user={selectedUser}
        open={isToggleStatusDialogOpen}
        onOpenChange={setIsToggleStatusDialogOpen}
        onConfirm={handleConfirmToggleStatus}
        isLoading={toggleStatus.isPending}
      />
    </div>
  );
}
