
import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import SidebarLogo from './AppSidebar/SidebarLogo';
import SidebarNavigation from './AppSidebar/SidebarNavigation';
import SidebarAccount from './AppSidebar/SidebarAccount';
import SidebarFooterComponent from './AppSidebar/SidebarFooter';

interface AppSidebarProps {
  user?: any;
  onSignOut?: () => void;
}

export function AppSidebar({ user, onSignOut }: AppSidebarProps) {
  const { language } = useLanguage();

  if (!user) return null;

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  const sidebarSide = language === 'ar' ? 'right' : 'left';

  return (
    <Sidebar 
      className={`bg-white ${language === 'ar' ? 'border-l border-gray-200' : 'border-r border-gray-200'}`} 
      collapsible="icon"
      side={sidebarSide}
    >
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6 space-y-8">
        <SidebarNavigation />
        <SidebarAccount />
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterComponent onSignOut={handleSignOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
