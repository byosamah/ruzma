
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const SidebarLogo = () => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className={`${isCollapsed ? 'px-3 py-4' : 'px-6 py-5'} border-b border-gray-100`}>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">R</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-gray-900 font-semibold text-lg">Ruzma</span>
            <span className="text-gray-500 text-xs">Freelancer Platform</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLogo;
