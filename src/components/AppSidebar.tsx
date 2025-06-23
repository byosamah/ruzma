
import React from 'react';
import { Home, User, FolderOpen, BarChart3, FileText, Settings, CreditCard, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useT } from '@/lib/i18n';

interface AppSidebarProps {
  user?: any;
  onSignOut?: () => void;
}

export function AppSidebar({ user, onSignOut }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const { state } = useSidebar();

  if (!user) return null;

  const menuItems = [
    {
      title: t('dashboard'),
      url: '/dashboard',
      icon: Home,
    },
    {
      title: t('yourProjects'),
      url: '/dashboard',
      icon: FolderOpen,
    },
    {
      title: t('analytics'),
      url: '/analytics',
      icon: BarChart3,
    },
    {
      title: t('templates'),
      url: '/templates',
      icon: FileText,
    },
  ];

  const accountItems = [
    {
      title: t('profile'),
      url: '/profile',
      icon: User,
    },
    {
      title: t('plans'),
      url: '/plans',
      icon: CreditCard,
    },
  ];

  const isActive = (url: string) => location.pathname === url;

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-center">
          {isCollapsed ? (
            <img 
              src="/lovable-uploads/946a5840-8d2f-4bbc-b2f3-3bc2603dbe7a.png" 
              alt="Ruzma Logo" 
              className="h-8 w-8" 
            />
          ) : (
            <img 
              src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" 
              alt="Ruzma Logo" 
              className="h-8" 
            />
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <button onClick={() => navigate(item.url)}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <button onClick={() => navigate(item.url)}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-red-50 text-red-600 hover:text-red-700"
                  tooltip={isCollapsed ? t('signOut') : undefined}
                >
                  <button onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    <span>{t('signOut')}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          © 2024 ProjectFlow
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
