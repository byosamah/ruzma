
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

interface EmailConfirmationScreenProps {
  email: string;
  isLoading: boolean;
  resendCooldown: number;
  onResendConfirmation: () => void;
}

const EmailConfirmationScreen = ({ 
  email, 
  isLoading, 
  resendCooldown, 
  onResendConfirmation 
}: EmailConfirmationScreenProps) => {
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
            <p className="font-semibold text-slate-800">{email}</p>
          </div>
          
          <div className="text-sm text-slate-600 space-y-2">
            <p>Please check your email and click the confirmation link to activate your account.</p>
            <p>Don't forget to check your spam folder if you don't see the email.</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onResendConfirmation}
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
};

export default EmailConfirmationScreen;
