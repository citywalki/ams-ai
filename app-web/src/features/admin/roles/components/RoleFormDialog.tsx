import { useEffect } from 'react';
import { Alert, Checkbox, Form, Input, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { type PermissionItem } from '@/lib/types';
import { type RoleFormData } from '../schemas/role-schema';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialValues: RoleFormData;
  error: string | null;
  permissions: PermissionItem[];
  onClose: () => void;
  onSubmit: (values: RoleFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  error,
  permissions,
  onClose,
  onSubmit,
  isSubmitting,
}: RoleFormDialogProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<RoleFormData>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [form, initialValues, open]);

  const permissionOptions = permissions.map((perm) => ({
    label: perm.name,
    value: perm.id,
  }));

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={
        mode === 'create'
          ? t('pages.roleManagement.dialog.createTitle')
          : t('pages.roleManagement.dialog.editTitle')
      }
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      onCancel={() => {
        onOpenChange(false);
        onClose();
      }}
      onOk={() => void form.submit()}
      confirmLoading={isSubmitting}
      width={760}
    >
      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={error}
        />
      )}
      <Form<RoleFormData>
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={initialValues}
        onFinish={(values) => void onSubmit(values)}
      >
        <Form.Item
          label={t('pages.roleManagement.form.code')}
          name="code"
          rules={[
            { required: true, message: '角色编码不能为空' },
            { max: 50, message: '角色编码最多50个字符' },
          ]}
        >
          <Input id="code" placeholder={t('pages.roleManagement.form.codePlaceholder')} />
        </Form.Item>
        <Form.Item
          label={t('pages.roleManagement.form.name')}
          name="name"
          rules={[
            { required: true, message: '角色名称不能为空' },
            { max: 100, message: '角色名称最多100个字符' },
          ]}
        >
          <Input id="name" placeholder={t('pages.roleManagement.form.namePlaceholder')} />
        </Form.Item>
        <Form.Item
          label={t('pages.roleManagement.form.description')}
          name="description"
          rules={[{ max: 500, message: '描述最多500个字符' }]}
        >
          <Input id="description" placeholder={t('pages.roleManagement.form.descriptionPlaceholder')} />
        </Form.Item>
        <Form.Item label={t('pages.roleManagement.form.permissions')} name="permissionIds">
          {permissionOptions.length === 0 ? (
            <div>{t('pages.roleManagement.messages.noPermissions')}</div>
          ) : (
            <Checkbox.Group options={permissionOptions} />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}
