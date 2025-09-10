
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useClientProject } from '@/hooks/useClientProject';
import { useClientBranding } from '@/hooks/useClientBranding';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { parseClientToken } from '@/lib/clientUrlUtils';
import { CurrencyCode } from '@/lib/currency';
import { formatCurrency } from '@/lib/currency';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import ContractApprovalModal from '@/components/ProjectClient/ContractApprovalModal';
import PaymentUploadDialog from '@/components/ProjectClient/PaymentUploadDialog';
import { parseDeliverableLinks } from '@/lib/linkUtils';
import { parseRevisionData, canRequestRevision, getRemainingRevisions } from '@/lib/revisionUtils';
import { useT } from '@/lib/i18n';
import ClientView from '@/components/MilestoneCard/ClientView';
import ModernClientHeader from '@/components/ClientProject/ModernClientHeader';
import { ServiceRegistry } from '@/services/core/ServiceRegistry';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import arabicReshaper from 'arabic-reshaper';
import bidi from 'bidi-js';


const ClientProject = () => {
  const { token } = useParams<{ token: string }>();
  const isMobile = useIsMobile();
  const [contractRejected, setContractRejected] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const t = useT();

  // Parse the token to handle both legacy and hybrid formats
  const parsedToken = token ? parseClientToken(token) : null;

  const {
    project,
    isLoading,
    error,
    needsContractApproval,
    handlePaymentUpload,
    handleRevisionRequest,
    userCurrency,
    freelancerCurrency,
    refetchProject,
  } = useClientProject(parsedToken?.token, parsedToken?.isHybrid);

  const {
    branding,
    isLoading: brandingLoading,
  } = useClientBranding(project?.user_id);

  // Loading State - Dashboard Style
  if (isLoading || brandingLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-none bg-gray-50">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Error State - Dashboard Style
  if (error || !project || !parsedToken) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-0 shadow-none">
            <span className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-4 block">🔍</span>
            <h1 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">{t('projectNotFound')}</h1>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
              {error || t('projectLinkInvalidExpired')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  // Use the project's stored currency (what was chosen when creating the project)
  const projectCurrency = project.currency || project.freelancer_currency || 'USD';
  
  // Always use the project's original currency (no conversion)
  const displayCurrency = projectCurrency;

  // Handle payment upload
  const handlePaymentUploadImpl = async (milestoneId: string, file: File): Promise<boolean> => {
    if (!project || !parsedToken) {
      return false;
    }

    try {
      const success = await handlePaymentUpload(milestoneId, file);
      if (success) {
        // Refetch project data to update milestone status
        refetchProject();
      }
      return success;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      return false;
    }
  };

  // Handle PDF download with proper Arabic support
  const handleDownloadPDF = async () => {
    // Create a hidden div with the contract content
    const contractElement = document.createElement('div');
    contractElement.style.position = 'absolute';
    contractElement.style.left = '-9999px';
    contractElement.style.top = '-9999px';
    contractElement.style.width = '800px';
    contractElement.style.padding = '40px';
    contractElement.style.backgroundColor = 'white';
    contractElement.style.fontFamily = '"Amiri", "Arabic Typesetting", "Traditional Arabic", Arial, sans-serif';
    contractElement.style.fontSize = '14px';
    contractElement.style.lineHeight = '1.6';
    contractElement.style.color = 'black';
    
    // Helper function to detect if text contains Arabic characters
    const containsArabic = (text: string) => {
      const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
      return arabicRegex.test(text);
    };

    // Helper function to shape Arabic text properly
    const shapeArabicText = (text: string) => {
      if (!containsArabic(text)) {
        return text;
      }
      
      try {
        // First reshape the Arabic text to connect letters
        const reshaped = arabicReshaper(text);
        // Then apply bidirectional text algorithm
        return bidi(reshaped, { dir: 'rtl' });
      } catch (error) {
        console.warn('Error shaping Arabic text:', error);
        return text;
      }
    };

    // Build HTML content with proper Arabic font support
    contractElement.innerHTML = `
      <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700&display=swap" rel="stylesheet">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700&display=swap');
        * {
          font-family: 'Cairo', 'Amiri', 'Arabic Typesetting', 'Traditional Arabic', Arial, sans-serif !important;
        }
        .arabic-text {
          font-feature-settings: "liga" on, "kern" on;
          text-rendering: optimizeLegibility;
        }
      </style>
      <div style="direction: ltr;">
        <h1 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px;">
          ${t('projectContract')}
        </h1>
        
        <div style="margin-bottom: 30px;">
          <p style="font-size: 18px; font-weight: bold; direction: ${containsArabic(project.name) ? 'rtl' : 'ltr'};">
            Project: ${shapeArabicText(project.name)}
          </p>
          <p style="direction: ${containsArabic(project.client_name || '') ? 'rtl' : 'ltr'};">
            Client: ${shapeArabicText(project.client_name || 'N/A')}
          </p>
          <p>Total Value: ${formatCurrency(totalValue, projectCurrency)}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <hr style="margin: 30px 0; border: 1px solid #ccc;" />

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">${t('generalContractTerms')}</h2>
          <div style="direction: ${containsArabic(project.contract_terms || '') ? 'rtl' : 'ltr'}; text-align: ${containsArabic(project.contract_terms || '') ? 'right' : 'left'}; white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${shapeArabicText(project.contract_terms || t('noContractTermsSpecified'))}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">${t('paymentTermsAndSchedule')}</h2>
          <div style="direction: ${containsArabic(project.payment_terms || '') ? 'rtl' : 'ltr'}; text-align: ${containsArabic(project.payment_terms || '') ? 'right' : 'left'}; white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${shapeArabicText(project.payment_terms || t('noContractTermsSpecified'))}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">${t('projectScopeAndDeliverables')}</h2>
          <div style="direction: ${containsArabic(project.project_scope || '') ? 'rtl' : 'ltr'}; text-align: ${containsArabic(project.project_scope || '') ? 'right' : 'left'}; white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${shapeArabicText(project.project_scope || t('noContractTermsSpecified'))}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">${t('revisionPolicyLabel')}</h2>
          <div style="direction: ${containsArabic(project.revision_policy || '') ? 'rtl' : 'ltr'}; text-align: ${containsArabic(project.revision_policy || '') ? 'right' : 'left'}; white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${shapeArabicText(project.revision_policy || t('noContractTermsSpecified'))}
          </div>
        </div>

        <hr style="margin: 30px 0; border: 1px solid #ccc;" />

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">${t('projectMilestonesLabel')}</h2>
          ${project.milestones.map((milestone, index) => `
            <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
              <h3 style="font-weight: bold; margin-bottom: 10px; direction: ${containsArabic(milestone.title) ? 'rtl' : 'ltr'}; text-align: ${containsArabic(milestone.title) ? 'right' : 'left'};">
                ${index + 1}. ${shapeArabicText(milestone.title)}
              </h3>
              <p style="margin-bottom: 8px; direction: ${containsArabic(milestone.description) ? 'rtl' : 'ltr'}; text-align: ${containsArabic(milestone.description) ? 'right' : 'left'};">
                <strong>${t('description')}</strong> ${shapeArabicText(milestone.description)}
              </p>
              <p style="margin-bottom: 8px;">
                <strong>${t('price')}</strong> ${formatCurrency(milestone.price, projectCurrency)}
              </p>
              <p style="margin-bottom: 0;">
                <strong>${t('statusLabel')}</strong> ${milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.replace('_', ' ').slice(1)}
              </p>
            </div>
          `).join('')}
        </div>

        <hr style="margin: 30px 0; border: 1px solid #ccc;" />
        
        <p style="text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
          Generated on ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    document.body.appendChild(contractElement);

    try {
      // Convert HTML to canvas with high quality
      const canvas = await html2canvas(contractElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: contractElement.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20); // Account for top and bottom margins

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      // Download the PDF
      const fileName = `${project.name.replace(/[^a-z0-9\u0600-\u06FF]/gi, '_')}_contract.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback: download as HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>Contract - ${project.name}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            .rtl { direction: rtl; text-align: right; }
            .ltr { direction: ltr; text-align: left; }
          </style>
        </head>
        <body>
          ${contractElement.innerHTML}
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-z0-9\u0600-\u06FF]/gi, '_')}_contract.html`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      document.body.removeChild(contractElement);
    }
  };

  // Dashboard-style stats for project overview
  const projectStats = [
    {
      title: t('totalValue'),
      value: null, // Will be rendered as CurrencyDisplay component
      subtitle: t('projectBudget'),
      emoji: '💰',
      amount: totalValue,
      currency: projectCurrency,
      convertTo: undefined, // No conversion - show original project currency only
      convertToUserCurrency: false, // CRITICAL: Disable automatic user currency conversion
      debugInfo: `Project stats: ${totalValue} ${projectCurrency} (no conversion)`,
    },
    {
      title: t('progress'),
      value: `${completedMilestones}/${totalMilestones}`,
      subtitle: t('milestonesComplete'),
      emoji: '📊',
    },
    {
      title: t('completion'),
      value: `${Math.round(progressPercentage)}%`,
      subtitle: t('overallProgress'),
      emoji: '✅',
    },
    {
      title: t('status'),
      value: project.contract_status === 'approved' ? t('active') : t('pending'),
      subtitle: t('projectStatus'),
      emoji: project.contract_status === 'approved' ? '🟢' : '🟡',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Contract Rejected State - Dashboard Style */}
      {contractRejected && (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-0 shadow-none">
            <span className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-4 block">⏰</span>
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">{t('feedbackSentSuccessfully')}</h2>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto leading-relaxed">
              {t('yourFeedbackHasBeenSent')}
            </p>
            <Badge variant="secondary" className="text-xs">
              {t('thankYouForFeedback')}
            </Badge>
          </div>
        </div>
      )}
      
      {/* Contract Approval Modal */}
      {needsContractApproval && project && !contractRejected && (
        <ContractApprovalModal
          isOpen={needsContractApproval}
          onClose={() => {}} // Cannot close until approved/rejected
          project={project}
          onApprovalComplete={refetchProject}
          onRejectionComplete={() => setContractRejected(true)}
        />
      )}
      
      {/* Main Content - Dashboard Style Layout */}
      {!needsContractApproval && !contractRejected && (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl">
          {/* Freelancer Header with Logo, Name, Title, and Bio */}
          <ModernClientHeader branding={branding} />
          
          {/* Project Header - Dashboard Style */}
          <header>
            <div className="space-y-1 sm:space-y-2 mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-medium text-gray-900">
                {project.name}
              </h1>
              <p className="text-sm text-gray-500">
                {project.brief || t('projectDetailsAndMilestoneTracking')}
              </p>
            </div>
          </header>

          {/* Project Stats - Dashboard Style */}
          <section aria-label="Project statistics">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              {projectStats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-none bg-gray-50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                        <span className="text-lg sm:text-2xl">{stat.emoji}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 truncate leading-tight">{stat.title}</p>
                        {stat.value ? (
                          <p className="text-base sm:text-lg font-medium text-gray-900 truncate leading-tight">{stat.value}</p>
                        ) : stat.amount !== undefined ? (
                          <div className="text-base sm:text-lg font-medium text-gray-900 truncate leading-tight">
                            <CurrencyDisplay
                              amount={stat.amount}
                              fromCurrency={projectCurrency}
                              toCurrency={undefined}
                              showConversionIndicator={false}
                              convertToUserCurrency={false}
                              className="text-base sm:text-lg font-medium text-gray-900"
                            />
                          </div>
                        ) : null}
                        <p className="text-xs text-gray-400 truncate leading-tight">{stat.subtitle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Contract Status Card - Full Style */}
          {project.contract_status && (
            <Card className="border-0 shadow-none bg-gray-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-gray-900">Contract Status</h3>
                  <Badge 
                    variant="outline" 
                    className={`${
                      project.contract_status === 'approved' 
                        ? 'text-green-600 border-green-600' 
                        : project.contract_status === 'pending'
                        ? 'text-orange-600 border-orange-600'
                        : 'text-gray-600 border-gray-600'
                    }`}
                  >
                    <span className="mr-1">
                      {project.contract_status === 'approved' ? '✅' : 
                       project.contract_status === 'pending' ? '⏰' : '📄'}
                    </span>
                    {project.contract_status === 'approved' ? 'Approved' : 
                     project.contract_status === 'pending' ? 'Pending Approval' : 'Contract'}
                  </Badge>
                </div>
                
                <div className={`p-3 rounded-lg ${
                  project.contract_status === 'approved' 
                    ? 'bg-green-50' 
                    : project.contract_status === 'pending'
                    ? 'bg-orange-50'
                    : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        project.contract_status === 'approved' 
                          ? 'text-green-800' 
                          : project.contract_status === 'pending'
                          ? 'text-orange-800'
                          : 'text-gray-800'
                      }`}>
                        {project.contract_status === 'approved' 
                          ? `Contract approved${project.contract_approved_at ? ` on ${new Date(project.contract_approved_at).toLocaleDateString()}` : ''}`
                          : project.contract_status === 'pending'
                          ? `Contract sent for approval${project.contract_sent_at ? ` on ${new Date(project.contract_sent_at).toLocaleDateString()}` : ''}`
                          : 'Contract information available'
                        }
                      </p>
                      
                      {project.contract_status === 'approved' && (
                        <p className="text-xs text-green-600 mt-1">
                          Project is active and ready for work
                        </p>
                      )}
                      
                      {project.contract_rejection_reason && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Feedback:</strong> {project.contract_rejection_reason}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowContractModal(true)}
                      className="inline-flex items-center gap-2 text-sm font-medium border-gray-300 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors ml-4"
                    >
                      <span>📄</span>
                      <span>{t('viewContract')}</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Milestones Section - Dashboard Style */}
          <main>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-medium text-gray-900">{t('projectMilestones')}</h2>
                <Badge variant="secondary" className="w-fit">
                  {completedMilestones} of {totalMilestones} {t('complete')}
                </Badge>
              </div>

              {/* Client Actions Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2">📋 {t('yourActions')}</h3>
                <div className="text-sm text-blue-800">
                  {project.milestones.some(m => m.status === 'pending_payment' || m.status === 'review' || m.status === 'pending' || m.status === 'rejected') && (
                    <p className="mb-2">• {t('uploadPaymentProofForApproved')}</p>
                  )}
                  {project.milestones.some(m => {
                    const links = parseDeliverableLinks(m.deliverable_link);
                    return links.length > 0 && (m.status === 'approved' || m.status === 'review' || m.status === 'in_progress');
                  }) && (
                    <p className="mb-2">• {t('viewDownloadDeliverablesCompleted')}</p>
                  )}
                  {!project.milestones.some(m => m.status === 'pending_payment' || m.status === 'review' || m.status === 'pending' || m.status === 'rejected') && 
                   !project.milestones.some(m => parseDeliverableLinks(m.deliverable_link).length > 0) && (
                    <p className="text-blue-600">{t('noActionsRequiredCheckBack')}</p>
                  )}
                </div>
              </div>

              {/* Milestone Cards */}
              <section aria-label="Project milestones" className="space-y-3 sm:space-y-4">
                {project.milestones.map((milestone, index) => {
                  // Parse revision data to show revision info
                  const revisionData = parseRevisionData(milestone);
                  const canRequest = canRequestRevision(revisionData);
                  const remainingRevisions = getRemainingRevisions(revisionData);
                  
                  return (
                    <Card key={milestone.id} className="border-0 shadow-none bg-gray-50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          {/* Milestone Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="p-2 rounded-lg flex-shrink-0">
                                <span className="text-xl">
                                  {milestone.status === 'approved' ? '✅' : 
                                   milestone.status === 'pending_payment' ? '💳' : 
                                   milestone.status === 'payment_submitted' ? '⏳' :
                                   milestone.status === 'rejected' ? '❌' :
                                   milestone.status === 'in_progress' ? '🔄' : '⏳'}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base font-medium text-gray-900 mb-1">{milestone.title}</h3>
                                <p className="text-sm text-gray-500 mb-2 leading-relaxed">{milestone.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                  <div className="text-xs">
                                    <CurrencyDisplay
                                      amount={milestone.price}
                                      fromCurrency={projectCurrency}
                                      toCurrency={undefined}
                                      showConversionIndicator={false}
                                      convertToUserCurrency={false}
                                      className="text-xs text-gray-400"
                                    />
                                  </div>
                                  <span className="capitalize">{milestone.status.replace('_', ' ')}</span>
                                </div>
                              </div>
                            </div>
                            <Badge 
                              variant={milestone.status === 'approved' ? 'default' : 
                                      milestone.status === 'rejected' ? 'destructive' : 'secondary'}
                            >
                              {milestone.status === 'approved' ? t('complete') : 
                               milestone.status === 'pending_payment' ? t('pendingPayment') : 
                               milestone.status === 'payment_submitted' ? t('paymentUnderReview') :
                               milestone.status === 'rejected' ? t('paymentRejected') :
                               milestone.status === 'in_progress' ? t('inProgress') : t('pending')}
                            </Badge>
                          </div>

                          {/* ClientView Component with Revision Functionality */}
                          <ClientView
                            milestone={milestone}
                            onPaymentUpload={handlePaymentUploadImpl}
                            onRevisionRequest={handleRevisionRequest}
                            token={parsedToken?.token}
                            paymentProofRequired={true}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </section>
            </div>
          </main>
        </div>
      )}
      
      {/* Contract View Modal */}
      <Dialog open={showContractModal} onOpenChange={setShowContractModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-gray-900 flex items-center gap-2">
              <span className="text-xl">📄</span>
              {t('projectContract')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Tabs defaultValue="contract" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="contract" className="flex items-center gap-1">
                  <span className="text-lg">📄</span>
                  Contract
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex items-center gap-1">
                  <span className="text-lg">💰</span>
                  Payment
                </TabsTrigger>
                <TabsTrigger value="scope" className="flex items-center gap-1">
                  <span className="text-lg">🎯</span>
                  Scope
                </TabsTrigger>
                <TabsTrigger value="revisions" className="flex items-center gap-1">
                  <span className="text-lg">🔄</span>
                  Revisions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contract" className="space-y-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">General Contract Terms</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {project.contract_terms || 'No contract terms specified.'}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Payment Terms and Schedule</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {project.payment_terms || 'No payment terms specified.'}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scope" className="space-y-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Project Scope and Deliverables</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {project.project_scope || 'No project scope specified.'}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="revisions" className="space-y-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Revision Policy</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {project.revision_policy || 'No revision policy specified.'}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => handleDownloadPDF()}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="text-lg">📄</span>
              {t('downloadAsPdf')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowContractModal(false)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              {t('close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientProject;
