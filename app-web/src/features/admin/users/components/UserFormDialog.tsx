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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type ReactFormExtendedApi } from '@tanstack/react-form';
import { type UserFormData } from '../schemas/user-schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserFormApi = ReactFormExtendedApi<UserFormData, any, any, any, any, any, any, any, any, any, any, any>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: UserFormApi;
  error: string | null;
  onClose: () => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  onClose,
}: UserFormDialogProps) {
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
                ? t('pages.userManagement.dialog.createTitle')
                : t('pages.userManagement.dialog.editTitle')}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? t('pages.userManagement.dialog.createDescription')
                : t('pages.userManagement.dialog.editDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form.Field name="username">
              {(field) => (
                <FormItem>
                  <FormLabel required>{t('pages.userManagement.form.username')}</FormLabel>
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
            <form.Field name="email">
              {(field) => (
                <FormItem>
                  <FormLabel>{t('pages.userManagement.form.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </FormControl>
                </FormItem>
              )}
            </form.Field>
            {mode === 'create' && (
              <form.Field name="password">
                {(field) => (
                  <FormItem>
                    <FormLabel required>{t('pages.userManagement.form.password')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        value={field.state.value as string}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              </form.Field>
            )}
            <form.Field name="status">
              {(field) => (
                <FormItem>
                  <FormLabel>{t('pages.userManagement.form.status')}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.state.value as string}
                      onValueChange={(value) => field.handleChange(value as 'ACTIVE' | 'INACTIVE')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">{t('pages.userManagement.status.active')}</SelectItem>
                        <SelectItem value="INACTIVE">{t('pages.userManagement.status.inactive')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
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
                ? t('pages.userManagement.messages.submitting')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
