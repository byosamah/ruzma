import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { FreelancerBranding } from '@/types/branding';
import { useT } from '@/lib/i18n';

interface ModernClientHeaderProps {
  branding?: FreelancerBranding | null;
}

const ModernClientHeader = ({ branding }: ModernClientHeaderProps) => {
  const t = useT();

  return (
    <Card className="border-0 shadow-none bg-gray-50 rounded-lg mb-6 sm:mb-8">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Logo/Avatar with Dashboard Styling */}
          <div className="flex-shrink-0">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
              <AvatarImage 
                src={branding?.logo_url} 
                alt={`${branding?.freelancer_name || 'Freelancer'} logo`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                <span className="text-3xl sm:text-4xl">👤</span>
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Freelancer Info - Dashboard Style */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              {/* Name */}
              <h1 className="text-xl sm:text-2xl font-medium text-gray-900 break-words">
                {branding?.freelancer_name || 'Professional Freelancer'}
              </h1>
              
              {/* Professional Title */}
              {branding?.freelancer_title && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">💼</span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {branding.freelancer_title}
                  </Badge>
                </div>
              )}
              
              {/* Bio */}
              {branding?.freelancer_bio && (
                <div className="pt-2">
                  <p className="text-sm text-gray-500 leading-relaxed break-words">
                    {branding.freelancer_bio}
                  </p>
                </div>
              )}
              
              {/* Client Portal Badge */}
              <div className="pt-2">
                <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                  🌐 {t('clientProjectPortal') || 'Client Project Portal'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernClientHeader;