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
import { type UserItem } from '@/lib/types';
import { type ReactFormExtendedApi } from '@tanstack/react-form';
import { type ResetPasswordFormData } from '../schemas/reset-password-schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResetPasswordFormApi = ReactFormExtendedApi<ResetPasswordFormData, any, any, any, any, any, any, any, any, any, any, any>;

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
  form: ResetPasswordFormApi;
  error: string | null;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  form,
  error,
}: ResetPasswordDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('pages.userManagement.dialog.resetPasswordTitle')}</DialogTitle>
          <DialogDescription>
            {t('pages.userManagement.dialog.resetPasswordDescription', {
              username: user?.username ?? '-',
            })}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form.Field name="newPassword">
              {(field) => (
                <FormItem>
                  <FormLabel required>{t('pages.userManagement.form.newPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            </form.Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting
                ? t('pages.userManagement.messages.processing')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
