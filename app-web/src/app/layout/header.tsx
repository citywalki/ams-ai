import { Bell, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 h-12 bg-white border-b border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
      <div className="flex h-full items-center px-4">
        {/* 左侧：菜单按钮 + Logo + 标题 */}
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#32363A] hover:bg-[#F5F5F5]"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0070D2] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-base font-semibold text-[#32363A]">AMS</h1>
              <span className="text-sm text-[#6A6D70]">告警管理系统</span>
            </div>
          </div>
        </div>

        {/* 右侧：工具图标组 + 用户 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative text-[#32363A] hover:bg-[#F5F5F5]"
          >
            <Bell className="h-4 w-4" />
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
            >
              3
            </Badge>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#32363A] hover:bg-[#F5F5F5]"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="relative h-8 w-8 rounded-full p-0 hover:bg-[#F5F5F5] outline-none"
            >
              <Avatar className="h-7 w-7 border border-[#E5E5E5]">
                <AvatarFallback className="bg-[#0070D2] text-white text-xs">
                  {user?.realName?.[0] || user?.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-[#32363A]">
                      {user?.realName || user?.username}
                    </p>
                    <p className="text-xs text-[#6A6D70]">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-sm text-[#32363A] cursor-pointer">
                个人资料
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm text-[#32363A] cursor-pointer">
                设置
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={logout}
                className="text-sm text-[#D9363E] cursor-pointer"
              >
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
