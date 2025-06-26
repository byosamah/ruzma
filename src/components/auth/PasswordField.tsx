
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

export const PasswordField: React.FC<PasswordFieldProps> = ({
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
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="apple-body text-foreground font-medium">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`pl-12 pr-12 ${error ? 'border-destructive focus:ring-destructive' : ''}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
          onClick={onTogglePassword}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive font-medium animate-apple-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
