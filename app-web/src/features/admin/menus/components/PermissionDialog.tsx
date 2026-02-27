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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
                ? t('pages.menuManagement.dialog.createPermissionTitle')
                : t('pages.menuManagement.dialog.editPermissionTitle')}
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
                  <FormLabel required>{t('pages.menuManagement.columns.code')}</FormLabel>
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
                  <FormLabel required>{t('pages.menuManagement.columns.name')}</FormLabel>
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
                  <FormLabel>{t('pages.menuManagement.columns.description')}</FormLabel>
                  <FormControl>
                    <Input
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </FormControl>
                </FormItem>
              )}
            </form.Field>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="sortOrder">
                {(field) => (
                  <FormItem>
                    <FormLabel>{t('pages.menuManagement.columns.sortOrder')}</FormLabel>
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
              <form.Field name="buttonType">
                {(field) => (
                  <FormItem>
                    <FormLabel>{t('pages.menuManagement.columns.buttonType')}</FormLabel>
                    <FormControl>
                      <Input
                        value={field.state.value as string}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="primary, danger..."
                      />
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
                ? t('pages.menuManagement.messages.submitting')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
