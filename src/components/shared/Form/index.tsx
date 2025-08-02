import React, { ReactNode } from 'react';
import { UseFormReturn, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/currency';

/**
 * Form context
 */
interface FormContextValue<T extends FieldValues> {
  form: UseFormReturn<T>;
  isSubmitting: boolean;
}

const FormContext = React.createContext<FormContextValue<any> | null>(null);

function useFormContext<T extends FieldValues>() {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('Form components must be used within Form.Root');
  }
  return context as FormContextValue<T>;
}

/**
 * Form Root Component
 */
interface FormRootProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: ReactNode;
  className?: string;
}

export function FormRoot<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className
}: FormRootProps<T>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <FormContext.Provider value={{ form, isSubmitting }}>
      <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

/**
 * Form Field Component
 */
interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  description,
  required,
  children,
  className
}: FormFieldProps<T>) {
  const { form } = useFormContext<T>();
  const fieldState = form.getFieldState(name);
  const error = fieldState.error;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={cn(error && 'text-destructive')}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}

/**
 * Form Input Component
 */
interface FormInputProps<T extends FieldValues> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: FieldPath<T>;
  type?: string;
}

export function FormInput<T extends FieldValues>({
  name,
  type = 'text',
  className,
  ...props
}: FormInputProps<T>) {
  const { form } = useFormContext<T>();

  return (
    <Input
      id={name}
      type={type}
      {...form.register(name)}
      className={cn(
        form.formState.errors[name] && 'border-destructive',
        className
      )}
      {...props}
    />
  );
}

/**
 * Form Textarea Component
 */
interface FormTextareaProps<T extends FieldValues> extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: FieldPath<T>;
}

export function FormTextarea<T extends FieldValues>({
  name,
  className,
  ...props
}: FormTextareaProps<T>) {
  const { form } = useFormContext<T>();

  return (
    <Textarea
      id={name}
      {...form.register(name)}
      className={cn(
        form.formState.errors[name] && 'border-destructive',
        className
      )}
      {...props}
    />
  );
}

/**
 * Form Select Component
 */
interface FormSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
}

export function FormSelect<T extends FieldValues>({
  name,
  placeholder = 'Select an option',
  options,
  className
}: FormSelectProps<T>) {
  const { form } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger 
            id={name}
            className={cn(
              form.formState.errors[name] && 'border-destructive',
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

/**
 * Form Date Picker Component
 */
interface FormDatePickerProps<T extends FieldValues> {
  name: FieldPath<T>;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  placeholder = 'Pick a date',
  className,
  minDate,
  maxDate
}: FormDatePickerProps<T>) {
  const { form } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={name}
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !field.value && 'text-muted-foreground',
                form.formState.errors[name] && 'border-destructive',
                className
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? format(new Date(field.value), 'PPP') : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={field.value ? new Date(field.value) : undefined}
              onSelect={(date) => field.onChange(date?.toISOString())}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    />
  );
}

/**
 * Form Currency Input Component
 */
interface FormCurrencyInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  currency?: string;
  className?: string;
  placeholder?: string;
}

export function FormCurrencyInput<T extends FieldValues>({
  name,
  currency = 'USD',
  className,
  placeholder = '0.00'
}: FormCurrencyInputProps<T>) {
  const { form } = useFormContext<T>();
  const symbol = getCurrencySymbol(currency);

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {symbol}
          </span>
          <Input
            id={name}
            type="number"
            step="0.01"
            min="0"
            placeholder={placeholder}
            className={cn(
              'pl-8',
              form.formState.errors[name] && 'border-destructive',
              className
            )}
            value={field.value || ''}
            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}
    />
  );
}

/**
 * Form Submit Button Component
 */
interface FormSubmitProps {
  children?: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  loadingText?: string;
}

export function FormSubmit({
  children = 'Submit',
  variant = 'default',
  size = 'default',
  className,
  loadingText = 'Submitting...'
}: FormSubmitProps) {
  const { isSubmitting } = useFormContext();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/**
 * Form Error Component
 */
export function FormError({ className }: { className?: string }) {
  const { form } = useFormContext();
  const rootError = form.formState.errors.root;

  if (!rootError) return null;

  return (
    <div className={cn('rounded-md bg-destructive/10 p-3', className)}>
      <p className="text-sm text-destructive">{rootError.message}</p>
    </div>
  );
}

/**
 * Complete Form Component
 */
export const Form = {
  Root: FormRoot,
  Field: FormField,
  Input: FormInput,
  Textarea: FormTextarea,
  Select: FormSelect,
  DatePicker: FormDatePicker,
  CurrencyInput: FormCurrencyInput,
  Submit: FormSubmit,
  Error: FormError,
};

/**
 * Simple Form wrapper for quick usage
 */
export function SimpleForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  submitText = 'Submit',
  className
}: {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: ReactNode;
  submitText?: string;
  className?: string;
}) {
  return (
    <Form.Root form={form} onSubmit={onSubmit} className={className}>
      {children}
      <Form.Error />
      <Form.Submit>{submitText}</Form.Submit>
    </Form.Root>
  );
}