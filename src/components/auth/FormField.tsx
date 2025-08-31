
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
  emoji?: string;
  required?: boolean;
}

export function FormField({
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
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}{required && ' *'}
      </Label>
      <div className="relative">
        {emoji && (
          <span className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-lg">
            {emoji}
          </span>
        )}
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${emoji ? 'pl-10 rtl:pl-3 rtl:pr-10' : ''} ${error ? 'border-red-500' : 'border-gray-200 focus:border-gray-400 focus:ring-0'} h-11`}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
