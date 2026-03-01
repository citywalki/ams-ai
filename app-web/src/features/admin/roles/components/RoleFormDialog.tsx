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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { type PermissionItem } from '@/lib/types';
import { type ReactFormExtendedApi } from '@tanstack/react-form';
import { type RoleFormData } from '../schemas/role-schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RoleFormApi = ReactFormExtendedApi<RoleFormData, any, any, any, any, any, any, any, any, any, any, any>;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: RoleFormApi;
  error: string | null;
  permissions: PermissionItem[];
  onClose: () => void;
  onTogglePermission: (permId: string) => void;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  permissions,
  onClose,
  onTogglePermission,
}: RoleFormDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
                ? t('pages.roleManagement.dialog.createTitle')
                : t('pages.roleManagement.dialog.editTitle')}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? t('pages.roleManagement.dialog.createDescription')
                : t('pages.roleManagement.dialog.editDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="code">
                {(field) => (
                  <FormItem>
                    <FormLabel required>{t('pages.roleManagement.form.code')}</FormLabel>
                    <FormControl>
                      <Input
                        id="code"
                        value={field.state.value as string}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder={t('pages.roleManagement.form.codePlaceholder')}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              </form.Field>
              <form.Field name="name">
                {(field) => (
                  <FormItem>
                    <FormLabel required>{t('pages.roleManagement.form.name')}</FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        value={field.state.value as string}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder={t('pages.roleManagement.form.namePlaceholder')}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              </form.Field>
            </div>
            <form.Field name="description">
              {(field) => (
                <FormItem>
                  <FormLabel>{t('pages.roleManagement.form.description')}</FormLabel>
                  <FormControl>
                    <Input
                      id="description"
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={t('pages.roleManagement.form.descriptionPlaceholder')}
                    />
                  </FormControl>
                </FormItem>
              )}
            </form.Field>
            <form.Field name="permissionIds">
              {(field) => (
                <FormItem>
                  <Label>{t('pages.roleManagement.form.permissions')}</Label>
                  <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                    {permissions.length === 0 ? (
                      <div className="text-muted-foreground text-sm">
                        {t('pages.roleManagement.messages.noPermissions')}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((perm) => (
                          <Button
                            key={perm.id}
                            type="button"
                            variant={(field.state.value as string[]).includes(perm.id) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onTogglePermission(perm.id)}
                          >
                            {perm.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            </form.Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting
                ? t('pages.roleManagement.messages.submitting')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
