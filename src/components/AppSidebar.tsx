
import React from 'react';
import { Home, User, FolderOpen, BarChart3, Settings, CreditCard, LogOut, FileText, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

interface AppSidebarProps {
  user?: any;
  onSignOut?: () => void;
}

export function AppSidebar({
  user,
  onSignOut
}: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const { language } = useLanguage();
  const {
    state
  } = useSidebar();

  if (!user) return null;

  const menuItems = [{
    title: t('dashboard'),
    url: '/dashboard',
    icon: Home
  }, {
    title: t('yourProjects'),
    url: '/projects',
    icon: FolderOpen
  }, {
    title: t('clients'),
    url: '/clients',
    icon: Users
  }, {
    title: t('invoices'),
    url: '/invoices',
    icon: FileText
  }, {
    title: t('analytics'),
    url: '/analytics',
    icon: BarChart3
  }];

  const accountItems = [{
    title: t('profile'),
    url: '/profile',
    icon: User
  }, {
    title: t('plans'),
    url: '/plans',
    icon: CreditCard
  }];

  const isActive = (url: string) => location.pathname === url;

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  const isCollapsed = state === 'collapsed';
  const sidebarSide = language === 'ar' ? 'right' : 'left';

  return (
    <Sidebar 
      className={`bg-gray-50/50 ${language === 'ar' ? 'border-l border-gray-100' : 'border-r border-gray-100'}`} 
      collapsible="icon"
      side={sidebarSide}
    >
      <SidebarHeader className={`${isCollapsed ? 'px-2 py-3' : 'px-4 py-4'} border-b border-gray-100`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          {isCollapsed ? (
            <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
              <span className="text-white text-sm font-bold">R</span>
            </div>
          ) : (
            <>
              <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">R</span>
              </div>
              <span className="text-gray-900 font-medium text-base">Ruzma</span>
            </>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className={`${isCollapsed ? 'px-2 py-4' : 'px-3 py-4'} space-y-6`}>
        <SidebarGroup className="space-y-2">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 px-2 mb-3">
              {t('main')}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)} 
                    className={`
                      w-full h-9 
                      ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'} 
                      text-sm font-normal rounded-lg transition-all duration-200
                      text-gray-600 hover:text-gray-900 hover:bg-gray-100/80
                      data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:font-medium
                      data-[active=true]:shadow-sm
                    `} 
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <button 
                      onClick={() => navigate(item.url)} 
                      className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="space-y-2">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 px-2 mb-3">
              {t('account')}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {accountItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)} 
                    className={`
                      w-full h-9 
                      ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'} 
                      text-sm font-normal rounded-lg transition-all duration-200
                      text-gray-600 hover:text-gray-900 hover:bg-gray-100/80
                      data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:font-medium
                      data-[active=true]:shadow-sm
                    `} 
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <button 
                      onClick={() => navigate(item.url)} 
                      className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`border-t border-gray-100 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-4'} space-y-2`}>
        {/* Language Selector */}
        {!isCollapsed && (
          <div className="pb-2">
            <LanguageSelector 
              className="w-full h-8 text-xs border-gray-200 hover:border-gray-300 bg-white" 
              showTextWhenCollapsed={true}
            />
          </div>
        )}
        
        {/* Sign Out Button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className={`
                w-full h-9 
                ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'} 
                text-sm font-normal rounded-lg transition-all duration-200
                text-red-600 hover:text-red-700 hover:bg-red-50
              `} 
              tooltip={isCollapsed ? t('signOut') : undefined}
            >
              <button 
                onClick={handleSignOut} 
                className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{t('signOut')}</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Copyright */}
        {!isCollapsed && (
          <div className="text-xs text-gray-400 px-2 pt-2">© 2025 Ruzma</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
