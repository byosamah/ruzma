
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-4 apple-container">
      <div className="absolute top-8 sm:top-12 animate-apple-fade-in">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" 
            alt="Ruzma Logo" 
            className="h-8 w-auto" 
          />
          <span className="apple-title-2 text-foreground">Ruzma</span>
        </Link>
      </div>

      <Card className="w-full max-w-md apple-shadow animate-apple-slide-up">
        <CardHeader className="text-center pb-6">
          <CardTitle className="apple-title-2 text-foreground mb-2">Welcome to Ruzma</CardTitle>
          <p className="apple-body text-muted-foreground">Start managing your freelance projects with ease</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex bg-muted rounded-full p-1 mb-8">
            <Button asChild variant="ghost" size="sm" className="flex-1 apple-button-ghost text-muted-foreground">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="default" size="sm" className="flex-1 apple-button-primary">
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              id="name"
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleFormDataChange}
              error={errors.name}
              icon={User}
              required
            />

            <FormField
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleFormDataChange}
              error={errors.email}
              icon={Mail}
              required
            />

            <CurrencySelect
              value={formData.currency}
              onChange={handleCurrencyChange}
              error={errors.currency}
              required
            />
            
            <PasswordField
              id="password"
              name="password"
              label="Create Password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleFormDataChange}
              error={errors.password}
              showPassword={showPassword}
              onTogglePassword={handleTogglePassword}
              required
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
              required
            />

            <Button 
              type="submit" 
              className="w-full apple-button-primary apple-shadow-sm" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="apple-caption">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="absolute bottom-6 text-center animate-apple-fade-in">
        <p className="apple-caption">
          © {new Date().getFullYear()} Ruzma. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignUpContainer;
