import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { FreelancerBranding } from '@/types/branding';
import { useT } from '@/lib/i18n';
import { getBestTextColor, getBestSecondaryTextColor, getBadgeColors } from '@/lib/colorUtils';
import LanguageSelector from '@/components/LanguageSelector';

interface ModernClientHeaderProps {
  branding?: FreelancerBranding | null;
}

const ModernClientHeader = ({ branding }: ModernClientHeaderProps) => {
  const t = useT();
  
  const backgroundColor = branding?.primary_color || '#f9fafb';
  const textColor = getBestTextColor(backgroundColor);
  const secondaryTextColor = getBestSecondaryTextColor(backgroundColor);
  const badgeColors = getBadgeColors(backgroundColor);

  return (
    <Card 
      className="border-0 shadow-none rounded-lg mb-6 sm:mb-8 relative"
      style={{
        backgroundColor
      }}
    >
      <CardContent className="p-4 sm:p-6">
        {/* Language Switcher - Top Right/Left based on direction */}
        <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
          <LanguageSelector 
            className="border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm" 
            showTextWhenCollapsed={false}
          />
        </div>

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
              <h1 
                className="text-xl sm:text-2xl font-medium break-words"
                style={{
                  color: textColor
                }}
              >
                {branding?.freelancer_name || t('professionalFreelancer')}
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
                  <p 
                    className="text-sm leading-relaxed break-words"
                    style={{
                      color: secondaryTextColor
                    }}
                  >
                    {branding.freelancer_bio}
                  </p>
                </div>
              )}
              
              {/* Client Portal Badge */}
              <div className="pt-2">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{
                    backgroundColor: badgeColors.backgroundColor,
                    color: badgeColors.color,
                    borderColor: badgeColors.borderColor
                  }}
                >
                  🌐 {t('clientProjectPortal')}
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