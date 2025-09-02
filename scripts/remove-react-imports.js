#!/usr/bin/env node

/**
 * Zero-Risk React Import Removal Script
 * Safely removes unnecessary "import React from 'react'" statements
 * Only removes if no React.* usage exists in the file
 */

import fs from 'fs';
import path from 'path';

// Files identified with unnecessary React imports
const filesToProcess = [
  'src/pages/Invoices.tsx',
  'src/pages/Profile.tsx',
  'src/pages/ContactUs.tsx',
  'src/pages/Analytics.tsx',
  'src/pages/ProjectTemplates.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/ClientProject.tsx',
  'src/pages/Plans.tsx',
  'src/pages/Projects.tsx',
  'src/components/FloatingContactButton.tsx',
  'src/components/ProjectClient/ProjectMilestonesList.tsx',
  'src/components/Analytics/AdvancedAnalyticsLayout.tsx',
  'src/components/ProjectClient/StickyNextStepBar.tsx',
  'src/components/Analytics/AnalyticsCharts.tsx',
  'src/components/ProjectClient/BrandedClientHeader.tsx',
  'src/components/ProjectClient/ClientProjectLoading.tsx',
  'src/components/Analytics/ClientIntelligence/ClientLifetimeValue.tsx',
  'src/components/MilestoneCard/StatusPill.tsx',
  'src/components/Analytics/ClientIntelligence/ClientRiskAssessment.tsx',
  'src/components/ProjectClient/PendingContractNotice.tsx',
  'src/components/Analytics/AnalyticsMetrics.tsx',
  'src/components/ProjectClient/ProjectPaymentDeliveryCard.tsx',
  'src/components/MilestoneCard/RevisionDetailsModal.tsx',
  'src/components/ProjectClient/ProjectOverviewCard.tsx',
  'src/components/Analytics/ProfitabilityAnalytics/RevenueOptimization.tsx',
  'src/components/Analytics/ProfitabilityAnalytics/ProjectTypeProfitability.tsx',
  'src/components/MilestoneCard/DeliverableManager.tsx',
  'src/components/ProjectClient/ClientProjectHeader.tsx',
  'src/components/Analytics/ProfitabilityAnalytics/PricingInsights.tsx',
  'src/components/Analytics/AnalyticsHeader.tsx',
  'src/components/ProjectClient/ClientProjectError.tsx',
  'src/components/ProjectClient/ProjectFooter.tsx',
  'src/components/ProjectCard/VerticalProjectCard.tsx',
  'src/components/Layout/MobileMenu.tsx',
  'src/components/Clients/ClientsStats.tsx',
  'src/components/Clients/ClientFilters.tsx',
  'src/components/ProjectCard/ProjectCardActions.tsx',
  'src/components/Clients/ClientsHeader.tsx',
  'src/components/ProjectCard/ProjectCardActionsFooter.tsx',
  'src/components/Layout/Header.tsx',
  'src/components/ProjectCard/ProjectCardContent.tsx',
  'src/components/ProjectCard/StandardProjectCard.tsx',
  'src/components/notifications/NotificationItem.tsx',
  'src/components/notifications/NotificationList.tsx',
  'src/components/Layout/LogoSection.tsx',
  'src/components/Layout/MainContent.tsx',
  'src/components/ProtectedRoute.tsx',
  'src/components/CreateProject/FormActions.tsx',
  'src/components/Invoices/InvoiceTable.tsx',
  'src/components/CreateProject/MilestonesList.tsx',
  'src/components/Invoices/InvoicesStats.tsx',
  'src/components/ClientProject/ModernProjectOverview.tsx',
  'src/components/ProjectManagement/ProjectHeaderInfo.tsx',
  'src/components/Layout/NavigationMenu.tsx',
  'src/components/Invoices/InvoicesSection.tsx',
  'src/components/auth/LoginHeader.tsx',
  'src/components/CreateProject/ProjectDetailsForm.tsx',
  'src/components/Invoices/InvoiceStatusBadge.tsx',
  'src/components/LanguageSelector.tsx',
  'src/components/ProjectManagement/MilestoneList.tsx',
  'src/components/Invoices/InvoiceFilters.tsx',
  'src/components/ClientProject/ModernInstructionsCard.tsx',
  'src/components/ProjectManagement/ProjectProgressBar.tsx',
  'src/components/auth/LoginFooter.tsx',
  'src/components/Invoices/InvoicesHeader.tsx',
  'src/components/auth/FormField.tsx',
  'src/components/ClientProject/ModernClientHeader.tsx',
  'src/components/AppSidebar/SidebarLogo.tsx',
  'src/components/auth/PasswordField.tsx',
  'src/components/CreateProject/SaveAsTemplateCheckbox.tsx',
  'src/components/AppSidebar/SidebarFooter.tsx',
  'src/components/auth/CurrencySelect.tsx',
  'src/components/dashboard/DashboardAnalyticsCharts.tsx',
  'src/components/CreateProject/PaymentProofSettings.tsx',
  'src/components/Profile/PersonalInformationForm.tsx',
  'src/components/auth/AuthToggle.tsx',
  'src/components/ProjectManagement/ProjectHeaderActions.tsx',
  'src/components/AppSidebar/SidebarNavigation.tsx',
  'src/components/dashboard/UsageIndicators.tsx',
  'src/components/AppSidebar/SidebarAccount.tsx',
  'src/components/ProjectManagement/ProjectStats.tsx',
  'src/components/dashboard/DashboardAnalytics.tsx',
  'src/components/SEO/SEOHead.tsx',
  'src/components/ProjectManagement/ProjectHeader.tsx',
  'src/components/dashboard/DashboardHeader.tsx',
  'src/components/Profile/ProfileAvatar.tsx',
  'src/components/AppSidebar.tsx',
  'src/components/shared/IconContainer.tsx',
  'src/components/shared/FormDialog.tsx',
  'src/components/dashboard/DashboardAnalyticsMetrics.tsx',
  'src/components/Layout.tsx',
  'src/components/shared/dialogs/BaseViewDialog.tsx',
  'src/components/shared/LoadingSpinner.tsx',
  'src/components/dashboard/UpcomingDeadlines.tsx',
  'src/components/shared/dialogs/BaseFormDialog.tsx',
  'src/components/shared/dialogs/BaseConfirmDialog.tsx',
  'src/components/CreateInvoice/InvoiceActions.tsx',
  'src/components/CreateInvoice/InvoicePreview.tsx',
  'src/components/Subscription/SubscriptionCard.tsx',
  'src/components/Subscription/SubscriptionPlans.tsx',
  'src/components/Subscription/SubscriptionCardFeatures.tsx',
  'src/components/Subscription/SubscriptionCardButton.tsx',
  'src/components/Subscription/SubscriptionCardHeader.tsx',
  'src/components/Subscription/SubscriptionCardBadge.tsx'
];

let processedCount = 0;
let skippedCount = 0;

function removeReactImport(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      skippedCount++;
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if file uses React.* anywhere
    if (content.includes('React.')) {
      console.log(`⏭️  Skipping ${filePath} - uses React.* syntax`);
      skippedCount++;
      return;
    }
    
    // Remove the import statement
    const originalContent = content;
    content = content.replace(/^import React from ['"]react['"];?\n/gm, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Removed React import from ${filePath}`);
      processedCount++;
    } else {
      console.log(`⏭️  No React import found in ${filePath}`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    skippedCount++;
  }
}

console.log('🚀 Starting React import removal...\n');

filesToProcess.forEach(file => {
  removeReactImport(file);
});

console.log('\n📊 Summary:');
console.log(`✅ Processed: ${processedCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files`);
console.log(`📁 Total: ${filesToProcess.length} files`);
console.log('\n✨ React import removal complete!');