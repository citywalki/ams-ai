import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "../schema/user";

interface ToggleStatusDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function ToggleStatusDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: ToggleStatusDialogProps) {
  const isDisabling = user?.status === "ACTIVE";
  const actionText = isDisabling ? "禁用" : "启用";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            确认{actionText}用户
          </DialogTitle>
          <DialogDescription>
            您确定要{actionText}用户 <strong>{user?.username}</strong> 吗？
            {isDisabling
              ? " 禁用后该用户将无法登录系统。"
              : " 启用后该用户将恢复登录权限。"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            type="button"
            variant={isDisabling ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认{actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
