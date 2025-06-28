
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormInputProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  type?: string;
  className?: string;
}

export const FormInput = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  className = ""
}: FormInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${className}`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
