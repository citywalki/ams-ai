import { Button, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { type RoleItem, type UserItem } from '@/lib/types';
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
    <Modal
      destroyOnHidden
      open={open}
      width={920}
      title={`${t('pages.roleManagement.actions.associateUsers')} - ${role?.name ?? ''}`}
      onCancel={() => onOpenChange(false)}
      footer={[
        <Button key="close" onClick={() => onOpenChange(false)}>
          {t('common.close')}
        </Button>,
      ]}
    >
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
    </Modal>
  );
}
