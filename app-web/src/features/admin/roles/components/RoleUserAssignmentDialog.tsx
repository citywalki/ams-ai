import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type RoleItem, type UserItem } from '@/utils/api';
import { RoleUserAssignment } from './RoleUserAssignment';

interface RoleUserAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleItem | null;
  allUsers: UserItem[];
  roleUsers: UserItem[];
  loading: boolean;
  error: string | null;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  onAssignUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
}

export function RoleUserAssignmentDialog({
  open,
  onOpenChange,
  role,
  allUsers,
  roleUsers,
  loading,
  error,
  searchKeyword,
  onSearchChange,
  onAssignUser,
  onRemoveUser,
}: RoleUserAssignmentDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {t('pages.roleManagement.actions.associateUsers')} - {role?.name}
          </DialogTitle>
          <DialogDescription>
            {t('pages.roleManagement.dialog.userAssignmentDescription')}
          </DialogDescription>
        </DialogHeader>
        <RoleUserAssignment
          roleId={role?.id || null}
          allUsers={allUsers}
          roleUsers={roleUsers}
          loading={loading}
          error={error}
          searchKeyword={searchKeyword}
          onSearchChange={onSearchChange}
          onAssignUser={onAssignUser}
          onRemoveUser={onRemoveUser}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
