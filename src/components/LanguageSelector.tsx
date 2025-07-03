
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  showTextWhenCollapsed?: boolean;
}

const LanguageSelector = ({ className, showTextWhenCollapsed = true }: LanguageSelectorProps) => {
  const { language, setLanguage } = useLanguage();

  const onSelectLanguage = (lang: string) => {
    // The enhanced setLanguage will handle navigation and persistence
    setLanguage(lang as 'en' | 'ar');
  };

  const getLanguageName = (lang: string) => {
    return lang === 'en' ? 'English' : 'العربية';
  };

  return (
    <Select value={language} onValueChange={onSelectLanguage}>
      <SelectTrigger className={`w-auto gap-2 ${className || ''}`}>
        <Globe className="h-4 w-4" />
        {showTextWhenCollapsed && <SelectValue placeholder={getLanguageName(language)} />}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ar">العربية</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
