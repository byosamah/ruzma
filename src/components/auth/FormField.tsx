
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: LucideIcon;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="apple-body text-foreground font-medium">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        )}
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${Icon ? 'pl-12' : ''} ${error ? 'border-destructive focus:ring-destructive' : ''}`}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive font-medium animate-apple-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
