import { useTranslation } from 'react-i18next';
import {
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';
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
import { type DictCategoryFormData } from '../schemas/dict-schema';

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
                ? t('pages.dictManagement.dialog.createCategoryTitle')
                : t('pages.dictManagement.dialog.editCategoryTitle')}
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
                <FormItem>
                  <FormLabel required>{t('pages.dictManagement.columns.code')}</FormLabel>
                  <FormControl>
                    <Input
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            </form.Field>
            <form.Field name="name">
              {(field) => (
                <FormItem>
                  <FormLabel required>{t('pages.dictManagement.columns.name')}</FormLabel>
                  <FormControl>
                    <Input
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            </form.Field>
            <form.Field name="description">
              {(field) => (
                <FormItem>
                  <FormLabel>{t('pages.dictManagement.columns.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </FormControl>
                </FormItem>
              )}
            </form.Field>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="sort">
                {(field) => (
                  <FormItem>
                    <FormLabel>{t('pages.dictManagement.columns.sortOrder')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.state.value as number}
                        onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                        onBlur={field.handleBlur}
                      />
                    </FormControl>
                  </FormItem>
                )}
              </form.Field>
              <form.Field name="status">
                {(field) => (
                  <FormItem>
                    <FormLabel>{t('pages.dictManagement.columns.status')}</FormLabel>
                    <FormControl>
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
                    </FormControl>
                  </FormItem>
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
