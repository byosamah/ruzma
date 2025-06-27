
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useT } from '@/lib/i18n';

interface SaveAsTemplateCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean | "indeterminate") => void;
}

const SaveAsTemplateCheckbox: React.FC<SaveAsTemplateCheckboxProps> = ({
  checked,
  onCheckedChange
}) => {
  const t = useT();

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="saveAsTemplate"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label
        htmlFor="saveAsTemplate"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {t('saveAsTemplate')}
      </Label>
    </div>
  );
};

export default SaveAsTemplateCheckbox;
