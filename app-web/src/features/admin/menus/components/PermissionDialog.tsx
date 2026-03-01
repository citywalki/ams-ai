import { useTranslation } from 'react-i18next';
import { Alert, Col, Form, Input, InputNumber, Modal, Row } from 'antd';
import { type ReactFormExtendedApi } from '@tanstack/react-form';
import { type PermissionFormData } from '../schemas/menu-schema';
import {
  FORM_COL_HALF,
  FORM_GRID_GUTTER,
  FORM_ITEM_COMPACT_STYLE,
  FULL_WIDTH_STYLE,
} from '@/styles/ui-patterns';

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
            <Form.Item style={FORM_ITEM_COMPACT_STYLE} label={t('pages.menuManagement.columns.code')} required>
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
            <Form.Item style={FORM_ITEM_COMPACT_STYLE} label={t('pages.menuManagement.columns.name')} required>
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
            <Form.Item style={FORM_ITEM_COMPACT_STYLE} label={t('pages.menuManagement.columns.description')}>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <Row gutter={FORM_GRID_GUTTER}>
          <Col {...FORM_COL_HALF}>
            <form.Field name="sortOrder">
              {(field) => (
                <Form.Item style={FORM_ITEM_COMPACT_STYLE} label={t('pages.menuManagement.columns.sortOrder')}>
                  <InputNumber
                    style={FULL_WIDTH_STYLE}
                    value={field.state.value as number}
                    onChange={(value) => field.handleChange(value ?? 0)}
                    onBlur={field.handleBlur}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
          <Col {...FORM_COL_HALF}>
            <form.Field name="buttonType">
              {(field) => (
                <Form.Item style={FORM_ITEM_COMPACT_STYLE} label={t('pages.menuManagement.columns.buttonType')}>
                  <Input
                    style={FULL_WIDTH_STYLE}
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={t('pages.menuManagement.form.buttonTypePlaceholder')}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
        </Row>
      </div>
    </Modal>
  );
}
