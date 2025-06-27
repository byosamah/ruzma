
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const SidebarLogo = () => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className={`${isCollapsed ? 'px-3 py-4' : 'px-6 py-5'} border-b border-gray-100`}>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        {isCollapsed ? (
          // Collapsed state - show icon logo
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <img 
              src="/lovable-uploads/131bc2f1-0492-4bef-bf77-1fe94008afc4.png" 
              alt="Ruzma" 
              className="w-6 h-6 object-contain"
            />
          </div>
        ) : (
          // Expanded state - show full logo
          <div className="flex items-center justify-start w-full">
            <img 
              src="/lovable-uploads/d7c62fd0-8ad6-4696-b936-c40ca12c9886.png" 
              alt="Ruzma - Freelancer Platform" 
              className="h-8 object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLogo;
