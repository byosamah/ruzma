
import React from 'react';
import { Home, User, FolderOpen, BarChart3, FileText, Settings, CreditCard } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { useT } from '@/lib/i18n';

interface AppSidebarProps {
  user?: any;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

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

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-gray-900">ProjectFlow</span>
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
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          © 2024 ProjectFlow
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
