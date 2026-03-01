import { Alert, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { type RoleItem } from '@/lib/types';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleItem | null;
  loading: boolean;
  error: string | null;
  onDelete: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  role,
  loading,
  error,
  onDelete,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={t('pages.roleManagement.dialog.deleteTitle')}
      okText={t('common.delete')}
      cancelText={t('common.cancel')}
      okButtonProps={{ danger: true, loading }}
      onCancel={() => onOpenChange(false)}
      onOk={onDelete}
    >
      <p>{t('pages.roleManagement.dialog.deleteDescription', { name: role?.name ?? '-' })}</p>
      {error && (
        <Alert
          style={{ marginTop: 12 }}
          type="error"
          showIcon
          message={error}
        />
      )}
    </Modal>
  );
}
