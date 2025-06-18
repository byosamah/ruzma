
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

const LanguageSelector = ({ className }: { className?: string }) => {
  const { language, setLanguage } = useLanguage();

  const onSelectLanguage = (lang: string) => {
    setLanguage(lang as 'en' | 'ar');
  };

  const getLanguageName = (lang: string) => {
    return lang === 'en' ? 'English' : 'العربية';
  };

  return (
    <Select value={language} onValueChange={onSelectLanguage}>
      <SelectTrigger className={`w-auto space-x-2 ${className || ''}`}>
        <Globe className="h-4 w-4" />
        <span>{getLanguageName(language)}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ar">العربية</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
