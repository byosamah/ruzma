
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, FileDown, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';

interface ProjectPaymentDeliveryCardProps {
  paymentProofRequired: boolean;
  branding?: FreelancerBranding | null;
}

const ProjectPaymentDeliveryCard: React.FC<ProjectPaymentDeliveryCardProps> = ({
  paymentProofRequired,
  branding
}) => {
  const t = useT();
  const primaryColor = branding?.primary_color || '#4B72E5';

  return (
    <Card className="bg-white shadow-sm border border-slate-100">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Settings className="w-4 h-4" style={{ color: primaryColor }} />
          </div>
          Payment & Delivery Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Requirements */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700 flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: primaryColor }} />
            Payment Requirements
          </h4>
          
          {paymentProofRequired ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Payment Proof Required</p>
                  <p className="text-xs text-amber-700 mt-1">
                    You must upload payment proof for each milestone before downloading deliverables. 
                    Accepted formats: JPG, PNG, PDF (Max 10MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">No Payment Proof Required</p>
                  <p className="text-xs text-green-700 mt-1">
                    Deliverables are available for download immediately upon completion.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Methods */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700">Delivery Methods</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileDown className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="text-sm font-medium text-slate-700">File Downloads</span>
              </div>
              <p className="text-xs text-slate-600">
                Direct file downloads for completed deliverables
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="text-sm font-medium text-slate-700">Shared Links</span>
              </div>
              <p className="text-xs text-slate-600">
                External links to cloud storage or online deliverables
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectPaymentDeliveryCard;
