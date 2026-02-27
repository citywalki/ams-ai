import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
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
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.code')}</Label>
                  <Input
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.name')}</Label>
                  <Input
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="value">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.value')}</Label>
                  <Input
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="remark">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.remark')}</Label>
                  <Textarea
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="sort">
                {(field) => (
                  <div className="space-y-2">
                    <Label>{t('pages.dictManagement.columns.sortOrder')}</Label>
                    <Input
                      type="number"
                      value={field.state.value as number}
                      onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="status">
                {(field) => (
                  <div className="space-y-2">
                    <Label>{t('pages.dictManagement.columns.status')}</Label>
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
                  </div>
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
