import React, { useState, useEffect } from 'react';
import { Settings, Check, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RevisionData } from '@/lib/revisionUtils';

interface RevisionSettingsDropdownProps {
  revisionData: RevisionData;
  onUpdateMaxRevisions: (maxRevisions: number | null) => void;
}

const RevisionSettingsDropdown: React.FC<RevisionSettingsDropdownProps> = ({
  revisionData,
  onUpdateMaxRevisions
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    revisionData.maxRevisions?.toString() ?? 'unlimited'
  );

  // Update selectedValue when revisionData changes
  useEffect(() => {
    
    setSelectedValue(revisionData.maxRevisions?.toString() ?? 'unlimited');
  }, [revisionData.maxRevisions]);

  const handleSave = () => {
    const newMaxRevisions = selectedValue === 'unlimited' ? null : parseInt(selectedValue);
    onUpdateMaxRevisions(newMaxRevisions);
    setIsOpen(false);
  };

  const getCurrentDisplayText = () => {
    if (revisionData.maxRevisions === null) return 'Unlimited';
    return `${revisionData.maxRevisions} max`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs gap-1.5 hover:bg-muted/50"
        >
          <Settings className="w-3 h-3" />
          {getCurrentDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Revision Limit</Label>
            <p className="text-xs text-muted-foreground">
              Set how many times the client can request revisions for this milestone.
            </p>
          </div>

          <div className="space-y-2">
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unlimited">
                  <div className="flex items-center gap-2">
                    <Infinity className="w-4 h-4" />
                    Unlimited
                  </div>
                </SelectItem>
                {[1, 2, 3, 4, 5, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} revision{num > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/30 rounded-lg p-3 text-xs">
            <div className="flex justify-between items-center">
              <span>Used:</span>
              <span className="font-medium">{revisionData.usedRevisions}</span>
            </div>
            {revisionData.maxRevisions !== null && (
              <div className="flex justify-between items-center mt-1">
                <span>Remaining:</span>
                <span className="font-medium">
                  {Math.max(0, revisionData.maxRevisions - revisionData.usedRevisions)}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-1.5"
            >
              <Check className="w-3 h-3" />
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RevisionSettingsDropdown;