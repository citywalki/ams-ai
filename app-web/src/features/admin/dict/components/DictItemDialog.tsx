import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? t('pages.dictManagement.dialog.createItemTitle')
                : t('pages.dictManagement.dialog.editItemTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form.Field name="code">
              {(field) => (
                <FormField label={t('pages.dictManagement.columns.code')} required>
                  <Input
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                  />
                </FormField>
              )}
            </form.Field>
            <form.Field name="name">
              {(field) => (
                <FormField label={t('pages.dictManagement.columns.name')} required>
                  <Input
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                  />
                </FormField>
              )}
            </form.Field>
            <form.Field name="value">
              {(field) => (
                <FormField label={t('pages.dictManagement.columns.value')}>
                  <Input
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </FormField>
              )}
            </form.Field>
            <form.Field name="remark">
              {(field) => (
                <FormField label={t('pages.dictManagement.columns.remark')}>
                  <Textarea
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </FormField>
              )}
            </form.Field>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="sort">
                {(field) => (
                  <FormField label={t('pages.dictManagement.columns.sortOrder')}>
                    <Input
                      type="number"
                      value={field.state.value as number}
                      onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                      onBlur={field.handleBlur}
                    />
                  </FormField>
                )}
              </form.Field>
              <form.Field name="status">
                {(field) => (
                  <FormField label={t('pages.dictManagement.columns.status')}>
                    <Select
                      value={String(field.state.value as number)}
                      onValueChange={(v) => field.handleChange(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{t('pages.dictManagement.status.active')}</SelectItem>
                        <SelectItem value="0">{t('pages.dictManagement.status.inactive')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              </form.Field>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting
                ? t('pages.dictManagement.messages.submitting')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
