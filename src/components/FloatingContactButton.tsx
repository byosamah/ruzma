import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
const FloatingContactButton = () => {
  const {
    language
  } = useLanguage();
  const isRTL = language === 'ar';
  return <div className={`fixed bottom-4 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} sm:bottom-6 z-50`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/contact">
            <Button size="icon" variant="accent" className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-150 active:scale-95 bg-slate-50">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side={isRTL ? 'right' : 'left'}>
          <p>Contact Us</p>
        </TooltipContent>
      </Tooltip>
    </div>;
};
export default FloatingContactButton;