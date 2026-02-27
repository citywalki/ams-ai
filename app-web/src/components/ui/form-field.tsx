import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  /** Label text */
  label: string;
  /** Whether the field is required (shows red asterisk) */
  required?: boolean;
  /** HTML for attribute to associate label with input */
  htmlFor?: string;
  /** Error message to display */
  error?: string;
  /** Helper text below the input */
  description?: string;
  /** Additional container class */
  className?: string;
  /** Label additional class */
  labelClassName?: string;
  /** The input/control element */
  children: React.ReactNode;
}

/**
 * A reusable form field wrapper that provides consistent layout,
 * label with required indicator, and error display.
 *
 * @example
 * // With Input
 * <FormField label="Username" required htmlFor="username">
 *   <Input id="username" required />
 * </FormField>
 *
 * @example
 * // With TanStack Form
 * <form.Field name="email">
 *   {(field) => (
 *     <FormField label="Email" htmlFor="email" error={field.state.meta.errors?.[0]?.toString()}>
 *       <Input id="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
 *     </FormField>
 *   )}
 * </form.Field>
 */
export function FormField({
  label,
  required,
  htmlFor,
  error,
  description,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor} className={labelClassName}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

/**
 * A specialized form field for inline controls like checkboxes and switches.
 * Renders label and control on the same line.
 */
export interface FormFieldInlineProps {
  label: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

export function FormFieldInline({
  label,
  required,
  htmlFor,
  className,
  labelClassName,
  children,
}: FormFieldInlineProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
      <Label htmlFor={htmlFor} className={cn('cursor-pointer', labelClassName)}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
    </div>
  );
}
