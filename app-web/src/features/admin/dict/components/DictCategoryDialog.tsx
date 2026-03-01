import { useTranslation } from 'react-i18next';
import { Alert, Col, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { type ReactFormExtendedApi } from '@tanstack/react-form';
import { type DictCategoryFormData } from '../schemas/dict-schema';
import {
  FORM_COL_HALF,
  FORM_GRID_GUTTER,
  FORM_ITEM_COMPACT_STYLE,
  FULL_WIDTH_STYLE,
} from '@/styles/ui-patterns';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DictCategoryFormApi = ReactFormExtendedApi<DictCategoryFormData, any, any, any, any, any, any, any, any, any, any, any>;

interface DictCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: DictCategoryFormApi;
  error: string | null;
  onClose: () => void;
}

export function DictCategoryDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  onClose,
}: DictCategoryDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={
        mode === 'create'
          ? t('pages.dictManagement.dialog.createCategoryTitle')
          : t('pages.dictManagement.dialog.editCategoryTitle')
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
            <Form.Item style={FORM_ITEM_COMPACT_STYLE} label={t('pages.dictManagement.columns.code')} required>
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
            <Form.Item style={FORM_ITEM_COMPACT_STYLE} label={t('pages.dictManagement.columns.name')} required>
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
            <Form.Item style={FORM_ITEM_COMPACT_STYLE} label={t('pages.dictManagement.columns.description')}>
              <Input.TextArea
                rows={3}
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </Form.Item>
          )}
        </form.Field>
        <Row gutter={FORM_GRID_GUTTER}>
          <Col {...FORM_COL_HALF}>
            <form.Field name="sort">
              {(field) => (
                <Form.Item style={FORM_ITEM_COMPACT_STYLE} label={t('pages.dictManagement.columns.sortOrder')}>
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
            <form.Field name="status">
              {(field) => (
                <Form.Item style={FORM_ITEM_COMPACT_STYLE} label={t('pages.dictManagement.columns.status')}>
                  <Select
                    style={FULL_WIDTH_STYLE}
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
          </Col>
        </Row>
      </div>
    </Modal>
  );
}
