
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from '@/lib/i18n';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ className }: { className?: string }) => {
  const { language, setLanguage } = useLanguage();
  const t = useT();

  const onSelectLanguage = (lang: string) => {
    setLanguage(lang as 'en' | 'ar');
  };

  return (
    <Select value={language} onValueChange={onSelectLanguage}>
      <SelectTrigger className={`w-auto space-x-2 ${className || ''}`}>
        <Globe className="h-4 w-4" />
        <SelectValue placeholder={t('language')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ar">العربية</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
