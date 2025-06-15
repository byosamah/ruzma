
import React from 'react';

const ClientProjectLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-slate-600 mt-2">Loading project...</p>
      </div>
    </div>
  );
};

export default ClientProjectLoading;
