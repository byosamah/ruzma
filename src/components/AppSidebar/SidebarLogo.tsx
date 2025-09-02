
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
          // Collapsed state - show icon logo (smaller size)
          <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
            <img 
              src={language === 'ar' ? "/assets/logo-icon-ar.svg" : "/assets/logo-icon-en.svg"}
              alt="Ruzma" 
              className="w-10 h-10 object-contain"
            />
          </div>
        ) : (
          // Expanded state - show full logo (smaller size)
          <div className="flex items-center justify-start w-full">
            <img 
              src={language === 'ar' ? "/assets/logo-full-ar.svg" : "/assets/logo-full-en.svg"}
              alt="Ruzma - Freelancer Platform" 
              className="h-14 object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLogo;
