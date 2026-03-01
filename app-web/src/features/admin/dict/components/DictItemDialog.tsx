import { useTranslation } from 'react-i18next';
import { Alert, Form, Input, InputNumber, Modal, Select, Space } from 'antd';
import { type ReactFormExtendedApi } from '@tanstack/react-form';
import { type DictItemFormData } from '../schemas/dict-schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DictItemFormApi = ReactFormExtendedApi<DictItemFormData, any, any, any, any, any, any, any, any, any, any, any>;

interface DictItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: DictItemFormApi;
  error: string | null;
  onClose: () => void;
}

export function DictItemDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  onClose,
}: DictItemDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={
        mode === 'create'
          ? t('pages.dictManagement.dialog.createItemTitle')
          : t('pages.dictManagement.dialog.editItemTitle')
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
            <Form.Item label={t('pages.dictManagement.columns.code')} required>
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
            <Form.Item label={t('pages.dictManagement.columns.name')} required>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <form.Field name="value">
          {(field) => (
            <Form.Item label={t('pages.dictManagement.columns.value')}>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <form.Field name="remark">
          {(field) => (
            <Form.Item label={t('pages.dictManagement.columns.remark')}>
              <Input.TextArea
                rows={3}
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <Space style={{ width: '100%' }} align="start">
          <form.Field name="sort">
            {(field) => (
              <Form.Item style={{ minWidth: 160 }} label={t('pages.dictManagement.columns.sortOrder')}>
                <InputNumber
                  style={{ width: '100%' }}
                  value={field.state.value as number}
                  onChange={(value) => field.handleChange(value ?? 0)}
                  onBlur={field.handleBlur}
                />
              </Form.Item>
            )}
          </form.Field>
          <form.Field name="status">
            {(field) => (
              <Form.Item style={{ minWidth: 180 }} label={t('pages.dictManagement.columns.status')}>
                <Select
                  value={String(field.state.value as number)}
                  onChange={(value) => field.handleChange(Number.parseInt(value, 10))}
                  options={[
                    { value: '1', label: t('pages.dictManagement.status.active') },
                    { value: '0', label: t('pages.dictManagement.status.inactive') },
                  ]}
                />
              </Form.Item>
            )}
          </form.Field>
        </Space>
      </div>
    </Modal>
  );
}
