import { Alert, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { type UserItem } from '@/lib/types';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  user,
  loading,
  error,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={t('pages.userManagement.dialog.deleteTitle')}
      okText={t('common.delete')}
      cancelText={t('common.cancel')}
      okButtonProps={{ danger: true, loading }}
      onCancel={() => onOpenChange(false)}
      onOk={onConfirm}
    >
      <p>
        {t('pages.userManagement.dialog.deleteDescription', {
          username: user?.username ?? '-',
        })}
      </p>
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
