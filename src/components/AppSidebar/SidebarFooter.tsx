
import { LogOut } from 'lucide-react';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useT } from '@/lib/i18n';
import LanguageSelector from '../LanguageSelector';

interface SidebarFooterProps {
  onSignOut: () => void;
}

const SidebarFooter = ({ onSignOut }: SidebarFooterProps) => {
  const t = useT();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className={`border-t border-gray-100 ${isCollapsed ? 'px-2 py-4' : 'px-4 py-5'} space-y-3`}>
      {/* Language Selector */}
      {!isCollapsed && (
        <div className="pb-2">
          <LanguageSelector
            className="w-full h-9 text-sm border-gray-200 hover:border-gray-300 bg-white"
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
              w-full h-10
              ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'}
              text-sm font-medium rounded-lg transition-all duration-200
              text-red-600 hover:text-red-700 hover:bg-red-50
            `}
            tooltip={isCollapsed ? t('signOut') : undefined}
          >
            <button
              onClick={onSignOut}
              className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{t('signOut')}</span>}
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Copyright */}
      {!isCollapsed && (
        <div className="text-xs text-gray-400 px-2 pt-2 border-t border-gray-100">
          © 2025 Ruzma
        </div>
      )}
    </div>
  );
};

export default SidebarFooter;
