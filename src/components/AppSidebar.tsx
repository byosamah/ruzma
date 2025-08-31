
import React from 'react';
import { User } from '@supabase/supabase-js';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import SidebarLogo from './AppSidebar/SidebarLogo';
import SidebarNavigation from './AppSidebar/SidebarNavigation';
import SidebarAccount from './AppSidebar/SidebarAccount';
import SidebarFooterComponent from './AppSidebar/SidebarFooter';

interface AppSidebarProps {
  user?: User;
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
      className={`bg-sidebar-background ${language === 'ar' ? 'border-l border-sidebar-border' : 'border-r border-sidebar-border'}`}
      collapsible="icon"
      side={sidebarSide}
    >
      <SidebarHeader className="p-6">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent className="px-4 py-2 space-y-6">
        <SidebarNavigation />
        <SidebarAccount />
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarFooterComponent onSignOut={handleSignOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
