
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
  icon: Icon
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />}
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${Icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
