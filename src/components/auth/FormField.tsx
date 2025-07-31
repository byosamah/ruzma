
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Icons replaced with emojis

interface FormFieldProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  emoji?: string;
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
  emoji,
  required = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}{required && ' *'}</Label>
      <div className="relative">
        {emoji && <span className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-lg">{emoji}</span>}
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${emoji ? 'pl-10 rtl:pl-3 rtl:pr-10' : ''} ${error ? 'border-red-500' : ''} h-10 sm:h-11 text-sm`}
        />
      </div>
      {error && <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
