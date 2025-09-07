import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";

interface SimpleUpgradeMessageProps {
  message: string;
}

function SimpleUpgradeMessage({ message }: SimpleUpgradeMessageProps) {
  const { navigate } = useLanguageNavigation();

  const handleUpgrade = () => {
    navigate('/plans');
  };

  return (
    <div className="text-center py-8 px-4">
      <div className="text-gray-400 mb-3">
        <Crown className="h-8 w-8 mx-auto" />
      </div>
      <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto leading-relaxed">
        {message}
      </p>
      <Button 
        onClick={handleUpgrade}
        size="sm"
        className="text-xs min-h-[44px] px-4"
      >
        <Crown className="h-3 w-3 mr-1" />
        Upgrade to Pro
      </Button>
    </div>
  );
}

export default memo(SimpleUpgradeMessage);