
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/lib/i18n';

const AISetupStatus: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
  const [message, setMessage] = useState('');
  const t = useT();

  const testAPIConnection = async () => {
    setIsChecking(true);
    setStatus('idle');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-project-milestones', {
        body: { 
          brief: 'Test project for API key validation - create a simple website with 3 milestones',
          language: 'en'
        }
      });

      if (error) {
        console.error('API test error:', error);
        if (error.message?.includes('authentication failed') || error.message?.includes('401')) {
          setStatus('error');
          setMessage('OpenAI API key is invalid or expired. Please update your API key.');
        } else if (error.message?.includes('not configured')) {
          setStatus('error');
          setMessage('OpenAI API key is not configured. Please add your API key to Supabase secrets.');
        } else {
          setStatus('warning');
          setMessage('API connection test failed. Check console for details.');
        }
        return;
      }

      if (data?.error) {
        if (data.error.includes('authentication failed')) {
          setStatus('error');
          setMessage('OpenAI API key is invalid or expired. Please update your API key.');
        } else if (data.error.includes('not configured')) {
          setStatus('error');
          setMessage('OpenAI API key is not configured. Please add your API key to Supabase secrets.');
        } else {
          setStatus('warning');
          setMessage(data.details || 'API test encountered an issue.');
        }
        return;
      }

      if (data?.milestones && data.milestones.length > 0) {
        setStatus('success');
        setMessage('OpenAI API connection is working correctly!');
      } else {
        setStatus('warning');
        setMessage('API connected but response format was unexpected.');
      }
    } catch (error) {
      console.error('Test failed:', error);
      setStatus('error');
      setMessage('Failed to test API connection. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-700 bg-green-50 border-green-200';
      case 'error': return 'text-red-700 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">AI Setup Status</CardTitle>
        <CardDescription className="text-xs">
          Test your OpenAI API configuration for milestone generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={testAPIConnection}
          disabled={isChecking}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test AI Connection'
          )}
        </Button>
        
        {status !== 'idle' && (
          <div className={`rounded-lg p-3 border ${getStatusColor()}`}>
            <div className="flex items-start gap-2">
              {getStatusIcon()}
              <p className="text-sm font-medium">{message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISetupStatus;
