
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  required?: boolean;
}

export function PasswordField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
  required = false
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}{required && ' *'}</Label>
      <div className="relative">
        <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`pl-10 rtl:pl-3 rtl:pr-10 pr-10 rtl:pr-10 rtl:pl-10 ${error ? 'border-red-500' : ''} h-10 sm:h-11 text-sm`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 rtl:right-auto rtl:left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={onTogglePassword}
        >
          {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />}
        </Button>
      </div>
      {error && <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
