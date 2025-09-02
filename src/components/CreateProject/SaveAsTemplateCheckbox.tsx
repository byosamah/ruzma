
import { Checkbox } from '@/components/ui/checkbox';
import { useT } from '@/lib/i18n';

interface SaveAsTemplateCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean | "indeterminate") => void;
}

const SaveAsTemplateCheckbox = ({ checked, onCheckedChange }: SaveAsTemplateCheckboxProps) => {
  const t = useT();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        <Checkbox
          id="saveAsTemplate"
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="mt-0.5"
        />
        <label
          htmlFor="saveAsTemplate"
          className="text-sm text-gray-700 leading-relaxed cursor-pointer"
        >
          {t('saveAsTemplateLabel')}
        </label>
      </div>
    </div>
  );
};

export default SaveAsTemplateCheckbox;
