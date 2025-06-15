
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ClientProjectErrorProps {
  error?: string;
}

const ClientProjectError: React.FC<ClientProjectErrorProps> = ({ error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Project Not Found</h1>
          <p className="text-slate-600">{error || "The project you're looking for doesn't exist or has been removed."}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProjectError;
