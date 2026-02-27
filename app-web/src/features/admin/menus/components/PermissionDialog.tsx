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
                <FormField label={t('pages.menuManagement.columns.code')} required htmlFor="code">
                  <Input
                    id="code"
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
                <FormField label={t('pages.menuManagement.columns.name')} required htmlFor="name">
                  <Input
                    id="name"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                  />
                </FormField>
              )}
            </form.Field>
            <form.Field name="description">
              {(field) => (
                <FormField label={t('pages.menuManagement.columns.description')} htmlFor="description">
                  <Input
                    id="description"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </FormField>
              )}
            </form.Field>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="sortOrder">
                {(field) => (
                  <FormField label={t('pages.menuManagement.columns.sortOrder')} htmlFor="sortOrder">
                    <Input
                      id="sortOrder"
                      type="number"
                      value={field.state.value as number}
                      onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                      onBlur={field.handleBlur}
                    />
                  </FormField>
                )}
              </form.Field>
              <form.Field name="buttonType">
                {(field) => (
                  <FormField label={t('pages.menuManagement.columns.buttonType')} htmlFor="buttonType">
                    <Input
                      id="buttonType"
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="primary, danger..."
                    />
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
                ? t('pages.menuManagement.messages.submitting')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
