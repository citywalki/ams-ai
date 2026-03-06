import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "../schema/user";
import { USER_STATUSES } from "../schema/user";

const userSchema = z.object({
  username: z.string().min(2, "用户名至少2个字符").max(50, "用户名最多50个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.union([
    z.string().min(8, "密码至少8个字符").max(100, "密码最多100个字符"),
    z.literal(""),
    z.undefined(),
  ]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void | Promise<void>;
  isLoading: boolean;
}

export function UserForm({
  user,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: UserFormProps) {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      password: "",
      status: (user?.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
    },
  });

  const handleFormSubmit = async (data: UserFormData) => {
    // 清理空密码：编辑模式下空密码表示不修改密码
    const cleanedData = {
      ...data,
      password: data.password || undefined,
    };
    await onSubmit(cleanedData);
  };

  useEffect(() => {
    if (open) {
      reset({
        username: user?.username || "",
        email: user?.email || "",
        password: "",
        status: (user?.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
      });
    }
  }, [user, open, reset]);

  // 当提交完成时（isLoading 从 true 变为 false），重置表单
  useEffect(() => {
    if (!isLoading && !open) {
      reset();
    }
  }, [isLoading, open, reset]);

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "编辑用户" : "创建用户"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "修改用户信息，密码留空表示不修改"
              : "填写信息创建新用户"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="请输入用户名"
              disabled={isEditing || isLoading}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="请输入邮箱"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="请输入密码"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">状态</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) =>
                setValue("status", value as "ACTIVE" | "INACTIVE")
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                {USER_STATUSES.filter((s) => s.value !== "LOCKED").map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
