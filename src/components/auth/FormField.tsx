
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
      <Label htmlFor={id} className="text-sm font-medium">{label}{required && ' *'}</Label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />}
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${Icon ? 'pl-10 rtl:pl-3 rtl:pr-10' : ''} ${error ? 'border-red-500' : ''} h-10 sm:h-11 text-sm`}
        />
      </div>
      {error && <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
