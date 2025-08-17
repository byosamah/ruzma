import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LanguageSelector from '@/components/LanguageSelector';
import { FreelancerBranding } from '@/types/branding';
import { User } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface ModernClientHeaderProps {
  branding?: FreelancerBranding | null;
}

const ModernClientHeader: React.FC<ModernClientHeaderProps> = ({ branding }) => {
  const t = useT();

  return (
    <Card className="border-0 rounded-none border-b">
      {/* Top Navigation Bar */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Badge variant="secondary" className="text-xs font-medium">
              {t('clientProjectPortal')}
            </Badge>
            <LanguageSelector />
          </div>
        </div>
      </div>
      
      {/* Freelancer Branding Section */}
      <CardContent className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start gap-4">
          {/* Modern Avatar */}
          <Avatar className="w-16 h-16 border-2 border-border">
            <AvatarImage 
              src={branding?.logo_url} 
              alt={`${branding?.freelancer_name || 'Freelancer'} logo`}
            />
            <AvatarFallback className="bg-muted">
              <User className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          {/* Freelancer Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {branding?.freelancer_name || 'Professional Freelancer'}
              </h1>
              {branding?.freelancer_title && (
                <Badge variant="outline" className="mt-2">
                  {branding.freelancer_title}
                </Badge>
              )}
            </div>
            
            {branding?.freelancer_bio && (
              <>
                <Separator className="my-3" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {branding.freelancer_bio}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernClientHeader;