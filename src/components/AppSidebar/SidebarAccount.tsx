
import { User, CreditCard } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useT } from '@/lib/i18n';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { ComponentErrorBoundary } from '@/components/shared/ErrorBoundary';

const SidebarAccount = () => {
  const { navigate, getCurrentPath } = useLanguageNavigation();
  const _location = useLocation();
  const t = useT();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const accountItems = [
    {
      title: t('profile'),
      url: '/profile',
      icon: User
    },
    {
      title: t('plans'),
      url: '/plans',
      icon: CreditCard
    }
  ];

  const isActive = (url: string) => getCurrentPath() === url;

  return (
    <ComponentErrorBoundary componentName="SidebarAccount">
      <SidebarGroup className="space-y-2">
        {!isCollapsed && (
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 px-2 mb-4">
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
    </ComponentErrorBoundary>
  );
};

export default SidebarAccount;
