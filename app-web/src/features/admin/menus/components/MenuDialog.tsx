import { useTranslation } from 'react-i18next';
import { FormField, FormFieldInline } from '@/components/ui/form-field';
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
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type ReactFormExtendedApi } from '@tanstack/react-form';
import { type MenuFormData } from '../schemas/menu-schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MenuFormApi = ReactFormExtendedApi<MenuFormData, any, any, any, any, any, any, any, any, any, any, any>;

interface MenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: MenuFormApi;
  error: string | null;
  onClose: () => void;
}

export function MenuDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  onClose,
}: MenuDialogProps) {
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
                ? t('pages.menuManagement.dialog.createMenuTitle')
                : t('pages.menuManagement.dialog.editMenuTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form.Field name="key">
              {(field) => (
                <FormField label="Key" required htmlFor="key">
                  <Input
                    id="key"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                  />
                </FormField>
              )}
            </form.Field>
            <form.Field name="label">
              {(field) => (
                <FormField label={t('pages.menuManagement.form.name')} required htmlFor="label">
                  <Input
                    id="label"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                  />
                </FormField>
              )}
            </form.Field>
            <form.Field name="route">
              {(field) => (
                <FormField label={t('pages.menuManagement.form.route')} htmlFor="route">
                  <Input
                    id="route"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </FormField>
              )}
            </form.Field>
            <form.Field name="icon">
              {(field) => (
                <FormField label={t('pages.menuManagement.form.icon')} htmlFor="icon">
                  <Input
                    id="icon"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </FormField>
              )}
            </form.Field>
            <form.Field name="rolesAllowed">
              {(field) => (
                <FormField label={t('pages.menuManagement.form.rolesAllowed')} htmlFor="rolesAllowed">
                  <Input
                    id="rolesAllowed"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="ROLE_ADMIN,ROLE_USER"
                  />
                </FormField>
              )}
            </form.Field>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="sortOrder">
                {(field) => (
                  <FormField label={t('pages.menuManagement.form.sortOrder')} htmlFor="sortOrder">
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
              <form.Field name="menuType">
                {(field) => (
                  <FormField label={t('pages.menuManagement.form.type')} htmlFor="menuType">
                    <Select
                      value={field.state.value as string}
                      onValueChange={(value) => field.handleChange(value as 'FOLDER' | 'MENU')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOLDER">{t('pages.menuManagement.form.folderType')}</SelectItem>
                        <SelectItem value="MENU">{t('pages.menuManagement.form.menuType')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              </form.Field>
            </div>
            <form.Field name="isVisible">
              {(field) => (
                <FormFieldInline label={t('pages.menuManagement.form.visible')} htmlFor="isVisible">
                  <Switch
                    id="isVisible"
                    checked={field.state.value as boolean}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </FormFieldInline>
              )}
            </form.Field>
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
