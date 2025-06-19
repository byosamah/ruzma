import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      console.log('Attempting to sign up with email:', formData.email);
      
      // Use hub.ruzma.co/login for redirect URL
      const redirectUrl = 'https://hub.ruzma.co/login';
      console.log('Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
          emailRedirectTo: redirectUrl
        }
      });

      console.log('SignUp response:', { data, error });

      if (error) {
        console.error('SignUp error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please try logging in instead.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        if (!data.session) {
          // User created but needs email confirmation - this is the correct flow
          console.log('User created, email confirmation required');
          toast.success('Account created! Please check your email and click the confirmation link to complete your registration.');
          setIsEmailSent(true);
        } else {
          // This shouldn't happen if email confirmation is enabled
          console.warn('User was automatically confirmed - check Supabase settings');
          toast.success('Account created and signed in successfully!');
          navigate('/dashboard');
        }
      } else {
        toast.error('Failed to create account. Please try again.');
      }
      
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before trying again.`);
      return;
    }

    if (!formData.email) {
      toast.error('Email address is required to resend confirmation.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting to resend confirmation email to:', formData.email);
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: 'https://hub.ruzma.co/login'
        }
      });

      console.log('Resend response:', { data, error });

      if (error) {
        console.error('Resend error:', error);
        
        // Handle rate limiting specifically
        if (error.message.includes('security purposes') || error.message.includes('after')) {
          // Extract the number of seconds from the error message if possible
          const secondsMatch = error.message.match(/(\d+)\s+seconds?/);
          const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 60;
          
          setResendCooldown(seconds);
          toast.error(`Please wait ${seconds} seconds before requesting another confirmation email.`);
          
          // Start countdown
          const interval = setInterval(() => {
            setResendCooldown(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and click the confirmation link first.');
        } else {
          toast.error(`Failed to resend confirmation email: ${error.message}`);
        }
      } else {
        console.log('Confirmation email resent successfully');
        toast.success('Confirmation email sent! Please check your inbox and spam folder.');
        
        // Set a small cooldown to prevent spam
        setResendCooldown(30);
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected error during resend:', error);
      toast.error('Failed to resend confirmation email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show confirmation sent screen
  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-auth-background flex flex-col items-center justify-center p-4">
        <div className="absolute top-10 sm:top-16">
          <Link to="/">
            <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-10" />
          </Link>
        </div>

        <Card className="w-full max-w-md shadow-lg bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">Check Your Email</CardTitle>
            <p className="text-slate-600">We've sent a confirmation link to your email address</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Mail className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-2">
                A confirmation email has been sent to:
              </p>
              <p className="font-semibold text-slate-800">{formData.email}</p>
            </div>
            
            <div className="text-sm text-slate-600 space-y-2">
              <p>Please check your email and click the confirmation link to activate your account.</p>
              <p>Don't forget to check your spam folder if you don't see the email.</p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleResendConfirmation}
                variant="outline" 
                className="w-full"
                disabled={isLoading || resendCooldown > 0}
              >
                {isLoading ? 'Sending...' : resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Resend Confirmation Email'}
              </Button>
              
              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="absolute bottom-8 text-sm text-slate-600">
          © {new Date().getFullYear()} Ruzma. All rights reserved.
        </div>
      </div>
    );
  }

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
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>

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

export default SignUp;
