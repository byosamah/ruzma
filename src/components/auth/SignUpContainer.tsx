
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from './FormField';
import { PasswordField } from './PasswordField';
import { CurrencySelect } from './CurrencySelect';
import { User, Mail } from 'lucide-react';
import { useSignUpForm } from '@/hooks/auth/useSignUpForm';

const SignUpContainer: React.FC = () => {
  const {
    formData,
    errors,
    showPassword,
    showConfirmPassword,
    isLoading,
    handleFormDataChange,
    handleCurrencyChange,
    handleSubmit,
    handleTogglePassword,
    handleToggleConfirmPassword,
  } = useSignUpForm();

  return (
    <div className="min-h-screen bg-auth-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-10 sm:top-16">
        <Link to="/">
          <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-10" />
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">Welcome to Ruzma</CardTitle>
          <p className="text-slate-600">Secure payment management for freelancers</p>
        </CardHeader>
        <CardContent>
          <div className="flex bg-slate-100 rounded-md p-1 mb-6">
            <Button asChild variant="ghost" className="w-1/2 text-slate-500">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="ghost" className="w-1/2 bg-white shadow-sm text-brand-navy font-semibold">Sign Up</Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              id="name"
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleFormDataChange}
              error={errors.name}
              icon={User}
            />

            <FormField
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleFormDataChange}
              error={errors.email}
              icon={Mail}
            />

            <CurrencySelect
              value={formData.currency}
              onChange={handleCurrencyChange}
              error={errors.currency}
            />
            
            <PasswordField
              id="password"
              name="password"
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleFormDataChange}
              error={errors.password}
              showPassword={showPassword}
              onTogglePassword={handleTogglePassword}
            />

            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleFormDataChange}
              error={errors.confirmPassword}
              showPassword={showConfirmPassword}
              onTogglePassword={handleToggleConfirmPassword}
            />

            <Button 
              type="submit" 
              className="w-full bg-brand-yellow text-brand-black hover:bg-brand-yellow/90" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="absolute bottom-8 text-sm text-slate-600">
        © {new Date().getFullYear()} Ruzma. All rights reserved.
      </div>
    </div>
  );
};

export default SignUpContainer;
