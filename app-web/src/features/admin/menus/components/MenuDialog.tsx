import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Form, Input, InputNumber, Modal, Select, Space, Switch } from 'antd';
import { type ReactFormExtendedApi } from '@tanstack/react-form';
import { type MenuFormData } from '../schemas/menu-schema';
import { type MenuItem } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MenuFormApi = ReactFormExtendedApi<MenuFormData, any, any, any, any, any, any, any, any, any, any, any>;

interface MenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: MenuFormApi;
  error: string | null;
  onClose: () => void;
  editingMenu?: MenuItem | null;
}

export function MenuDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  onClose,
  editingMenu,
}: MenuDialogProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (open && editingMenu) {
      form.setFieldValue('key', editingMenu.key);
      form.setFieldValue('label', editingMenu.label);
      form.setFieldValue('route', editingMenu.route || '');
      form.setFieldValue('icon', editingMenu.icon || '');
      form.setFieldValue('sortOrder', editingMenu.sortOrder);
      form.setFieldValue('isVisible', editingMenu.isVisible);
      form.setFieldValue('menuType', editingMenu.menuType);
      form.setFieldValue('rolesAllowed', (editingMenu.rolesAllowed || []).join(','));
    }
  }, [open, editingMenu, form]);

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={
        mode === 'create'
          ? t('pages.menuManagement.dialog.createMenuTitle')
          : t('pages.menuManagement.dialog.editMenuTitle')
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
        <form.Field name="key">
          {(field) => (
            <Form.Item label={t('pages.menuManagement.form.key')} required>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <form.Field name="label">
          {(field) => (
            <Form.Item label={t('pages.menuManagement.form.name')} required>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <form.Field name="route">
          {(field) => (
            <Form.Item label={t('pages.menuManagement.form.route')}>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <form.Field name="icon">
          {(field) => (
            <Form.Item label={t('pages.menuManagement.form.icon')}>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <form.Field name="rolesAllowed">
          {(field) => (
            <Form.Item label={t('pages.menuManagement.form.rolesAllowed')}>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder={t('pages.menuManagement.form.rolesAllowedPlaceholder')}
              />
            </Form.Item>
          )}
        </form.Field>
        <Space style={{ width: '100%' }} align="start">
          <form.Field name="sortOrder">
            {(field) => (
              <Form.Item style={{ minWidth: 160 }} label={t('pages.menuManagement.form.sortOrder')}>
                <InputNumber
                  style={{ width: '100%' }}
                  value={field.state.value as number}
                  onChange={(value) => field.handleChange(value ?? 0)}
                  onBlur={field.handleBlur}
                />
              </Form.Item>
            )}
          </form.Field>
          <form.Field name="menuType">
            {(field) => (
              <Form.Item style={{ minWidth: 200 }} label={t('pages.menuManagement.form.type')}>
                <Select
                  value={field.state.value as string}
                  onChange={(value) => field.handleChange(value as 'FOLDER' | 'MENU')}
                  options={[
                    { value: 'FOLDER', label: t('pages.menuManagement.form.folderType') },
                    { value: 'MENU', label: t('pages.menuManagement.form.menuType') },
                  ]}
                />
              </Form.Item>
            )}
          </form.Field>
        </Space>
        <form.Field name="isVisible">
          {(field) => (
            <Form.Item label={t('pages.menuManagement.form.visible')}>
              <Switch
                checked={field.state.value as boolean}
                onChange={(checked) => field.handleChange(checked)}
              />
            </Form.Item>
          )}
        </form.Field>
      </div>
    </Modal>
  );
}
