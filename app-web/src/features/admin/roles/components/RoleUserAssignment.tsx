import { Search, Plus, X, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type UserItem } from '@/lib/types';

interface RoleUserAssignmentProps {
  roleId: string | null;
  allUsers: UserItem[];
  roleUsers: UserItem[];
  loading: boolean;
  error: string | null;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  onAssignUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
}

export function RoleUserAssignment({
  allUsers,
  roleUsers,
  loading,
  error,
  searchKeyword,
  onSearchChange,
  onAssignUser,
  onRemoveUser,
}: RoleUserAssignmentProps) {
  const { t } = useTranslation();

  const roleUserIds = new Set(roleUsers.map((u) => u.id));

  const filteredUsers = allUsers.filter((user) => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      user.username.toLowerCase().includes(keyword) ||
      (user.email && user.email.toLowerCase().includes(keyword))
    );
  });

  const assignedUsers = filteredUsers.filter((user) => roleUserIds.has(user.id));
  const unassignedUsers = filteredUsers.filter((user) => !roleUserIds.has(user.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {t('pages.roleManagement.form.userAssignment')}
        </span>
        <Badge variant="secondary">{roleUsers.length}</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('pages.roleManagement.form.searchUsers')}
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t('pages.roleManagement.messages.noUsers')}
              </div>
            ) : (
              <>
                {assignedUsers.length > 0 && (
                  <div className="p-2 space-y-1">
                    <div className="text-xs text-muted-foreground px-2 py-1">
                      {t('pages.roleManagement.form.assignedUsers')}
                    </div>
                    {assignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user.username}</div>
                            {user.email && (
                              <div className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveUser(user.id)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {unassignedUsers.length > 0 && (
                  <div className="p-2 space-y-1">
                    <div className="text-xs text-muted-foreground px-2 py-1">
                      {t('pages.roleManagement.form.availableUsers')}
                    </div>
                    {unassignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user.username}</div>
                            {user.email && (
                              <div className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onAssignUser(user.id)}
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
