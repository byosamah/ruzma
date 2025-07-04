
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';

const SidebarLogo = () => {
  const { state } = useSidebar();
  const { language } = useLanguage();
  const isCollapsed = state === 'collapsed';

  return (
    <div className={`${isCollapsed ? 'px-3 py-4' : 'px-6 py-5'} border-b border-gray-100`}>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        {isCollapsed ? (
          // Collapsed state - show icon logo (reduced size)
          <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
            <img 
              src={language === 'ar' ? "/lovable-uploads/ab67abeb-5005-4f3d-a78b-8a21c84d6af8.png" : "/lovable-uploads/131bc2f1-0492-4bef-bf77-1fe94008afc4.png"}
              alt="Ruzma" 
              className="w-12 h-12 object-contain"
            />
          </div>
        ) : (
          // Expanded state - show full logo (reduced size)
          <div className="flex items-center justify-start w-full">
            <img 
              src={language === 'ar' ? "/lovable-uploads/f9012af4-c8c9-42cd-a738-0e3a0d31aa46.png" : "/lovable-uploads/d7c62fd0-8ad6-4696-b936-c40ca12c9886.png"}
              alt="Ruzma - Freelancer Platform" 
              className="h-16 object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLogo;
