import { useTranslation } from 'react-i18next';
import { Alert, Form, Input, InputNumber, Modal, Space } from 'antd';
import { type ReactFormExtendedApi } from '@tanstack/react-form';
import { type PermissionFormData } from '../schemas/menu-schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PermissionFormApi = ReactFormExtendedApi<PermissionFormData, any, any, any, any, any, any, any, any, any, any, any>;

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: PermissionFormApi;
  error: string | null;
  onClose: () => void;
}

export function PermissionDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  onClose,
}: PermissionDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={
        mode === 'create'
          ? t('pages.menuManagement.dialog.createPermissionTitle')
          : t('pages.menuManagement.dialog.editPermissionTitle')
      }
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      okButtonProps={{ loading: form.state.isSubmitting }}
      onCancel={onClose}
      onOk={() => void form.handleSubmit()}
      afterOpenChange={(nextOpen) => onOpenChange(nextOpen)}
    >
      <div className="space-y-4 py-2">
        {error && <Alert type="error" showIcon message={error} />}
        <form.Field name="code">
          {(field) => (
            <Form.Item label={t('pages.menuManagement.columns.code')} required>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <form.Field name="name">
          {(field) => (
            <Form.Item label={t('pages.menuManagement.columns.name')} required>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <Form.Item label={t('pages.menuManagement.columns.description')}>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <Space style={{ width: '100%' }} align="start">
          <form.Field name="sortOrder">
            {(field) => (
              <Form.Item style={{ minWidth: 160 }} label={t('pages.menuManagement.columns.sortOrder')}>
                <InputNumber
                  style={{ width: '100%' }}
                  value={field.state.value as number}
                  onChange={(value) => field.handleChange(value ?? 0)}
                  onBlur={field.handleBlur}
                />
              </Form.Item>
            )}
          </form.Field>
          <form.Field name="buttonType">
            {(field) => (
              <Form.Item style={{ minWidth: 200 }} label={t('pages.menuManagement.columns.buttonType')}>
                <Input
                  value={field.state.value as string}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t('pages.menuManagement.form.buttonTypePlaceholder')}
                />
              </Form.Item>
            )}
          </form.Field>
        </Space>
      </div>
    </Modal>
  );
}
