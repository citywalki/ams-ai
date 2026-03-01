import { Alert, Form, Input, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { type UserItem } from '@/lib/types';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
  newPassword: string;
  onPasswordChange: (value: string) => void;
  error: string | null;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  newPassword,
  onPasswordChange,
  error,
  onSubmit,
  isSubmitting,
}: ResetPasswordDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={t('pages.userManagement.dialog.resetPasswordTitle')}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      onCancel={() => onOpenChange(false)}
      onOk={() => void onSubmit()}
      confirmLoading={isSubmitting}
    >
      <p style={{ marginBottom: 12 }}>
        {t('pages.userManagement.dialog.resetPasswordDescription', {
          username: user?.username ?? '-',
        })}
      </p>
      {error && <Alert showIcon type="error" style={{ marginBottom: 12 }} message={error} />}
      <Form layout="vertical">
        <Form.Item
          label={t('pages.userManagement.form.newPassword')}
          required
          validateStatus={error ? 'error' : undefined}
        >
          <Input.Password value={newPassword} onChange={(e) => onPasswordChange(e.target.value)} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
