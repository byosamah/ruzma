
import React from 'react';
import { Briefcase } from 'lucide-react';

const ClientProjectHeader: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Client Project Portal</h1>
            <p className="text-slate-600">Track your project progress and make payments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectHeader;
