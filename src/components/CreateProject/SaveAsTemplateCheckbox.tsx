
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useT } from '@/lib/i18n';

interface SaveAsTemplateCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean | "indeterminate") => void;
}

const SaveAsTemplateCheckbox = ({ checked, onCheckedChange }: SaveAsTemplateCheckboxProps) => {
  const t = useT();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="saveAsTemplate"
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <label
          htmlFor="saveAsTemplate"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t('saveAsTemplateLabel')}
        </label>
      </div>
    </div>
  );
};

export default SaveAsTemplateCheckbox;
