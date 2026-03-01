import { useEffect } from 'react';
import { Alert, Form, Input, Modal, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { type UserFormData } from '../schemas/user-schema';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialValues: UserFormData;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: UserFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  error,
  onClose,
  onSubmit,
  isSubmitting,
}: UserFormDialogProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<UserFormData>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [form, initialValues, open]);

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={
        mode === 'create'
          ? t('pages.userManagement.dialog.createTitle')
          : t('pages.userManagement.dialog.editTitle')
      }
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      onCancel={() => {
        onOpenChange(false);
        onClose();
      }}
      onOk={() => void form.submit()}
      confirmLoading={isSubmitting}
    >
      {error && <Alert showIcon type="error" style={{ marginBottom: 16 }} message={error} />}
      <Form<UserFormData>
        form={form}
        preserve={false}
        layout="vertical"
        initialValues={initialValues}
        onFinish={(values) => void onSubmit(values)}
      >
        <Form.Item
          label={t('pages.userManagement.form.username')}
          name="username"
          rules={[
            { required: true, message: '用户名不能为空' },
            { max: 50, message: '用户名最多50个字符' },
          ]}
        >
          <Input id="username" />
        </Form.Item>
        <Form.Item
          label={t('pages.userManagement.form.email')}
          name="email"
          rules={[
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input id="email" type="email" />
        </Form.Item>
        {mode === 'create' && (
          <Form.Item
            label={t('pages.userManagement.form.password')}
            name="password"
            rules={[
              { required: true, message: '密码至少6个字符' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password id="password" />
          </Form.Item>
        )}
        <Form.Item label={t('pages.userManagement.form.status')} name="status">
          <Select
            options={[
              { value: 'ACTIVE', label: t('pages.userManagement.status.active') },
              { value: 'INACTIVE', label: t('pages.userManagement.status.inactive') },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
