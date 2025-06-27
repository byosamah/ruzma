
import React from 'react';
import { Home, FolderOpen, Users, FileText, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useT } from '@/lib/i18n';

const SidebarNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const menuItems = [
    {
      title: t('dashboard'),
      url: '/dashboard',
      icon: Home
    },
    {
      title: t('yourProjects'),
      url: '/projects',
      icon: FolderOpen
    },
    {
      title: t('clients'),
      url: '/clients',
      icon: Users
    },
    {
      title: t('invoices'),
      url: '/invoices',
      icon: FileText
    },
    {
      title: t('analytics'),
      url: '/analytics',
      icon: BarChart3
    }
  ];

  const isActive = (url: string) => location.pathname === url;

  return (
    <SidebarGroup className="space-y-2">
      {!isCollapsed && (
        <SidebarGroupLabel className="text-xs font-medium text-gray-500 px-2 mb-4">
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
                  w-full h-10 
                  ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'} 
                  text-sm font-medium rounded-lg transition-all duration-200
                  text-gray-700 hover:text-gray-900 hover:bg-gray-50
                  data-[active=true]:bg-black data-[active=true]:text-white
                  data-[active=true]:shadow-lg
                `} 
                tooltip={isCollapsed ? item.title : undefined}
              >
                <button 
                  onClick={() => navigate(item.url)} 
                  className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarNavigation;
