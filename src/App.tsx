
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LanguageLayout } from "@/components/LanguageLayout";
import { RedirectWithParams } from "@/components/RedirectWithParams";
import { Suspense, lazy } from "react";

// Import Login directly to avoid dynamic import issues
import Login from "./pages/Login";

// Lazy load other route components
const SignUp = lazy(() => import("./pages/SignUp"));
const EmailConfirmation = lazy(() => import("./pages/EmailConfirmation"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Profile = lazy(() => import("./pages/Profile"));
const Plans = lazy(() => import("./pages/Plans"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const EditProject = lazy(() => import("./pages/EditProject"));
const ProjectManagement = lazy(() => import("./pages/ProjectManagement"));
const ProjectTemplates = lazy(() => import("./pages/ProjectTemplates"));
const ClientProject = lazy(() => import("./pages/ModernClientProject"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const ContractApproval = lazy(() => import("./pages/ContractApproval"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Invoices = lazy(() => import("./pages/Invoices"));
const CreateInvoice = lazy(() => import("./pages/CreateInvoice"));
const Clients = lazy(() => import("./pages/Clients"));

// Optimized loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000,    // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <InvoiceProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Root redirect - handled by LanguageProvider */}
                  <Route path="/" element={<Navigate to="/en/dashboard" replace />} />
                  
                   {/* Language-agnostic routes */}
                  <Route path="/client/:token" element={<ClientProject />} />
                  <Route path="/client/project/:token" element={<ClientProject />} />
                  <Route path="/contract/approve/:token" element={<ContractApproval />} />
                  
                  {/* Language-specific auth routes */}
                  <Route path="/:lang/login" element={
                    <LanguageLayout>
                      <Login />
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/signup" element={
                    <LanguageLayout>
                      <SignUp />
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/email-confirmation" element={
                    <LanguageLayout>
                      <EmailConfirmation />
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/forgot-password" element={
                    <LanguageLayout>
                      <ForgotPassword />
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/reset-password" element={
                    <LanguageLayout>
                      <ResetPassword />
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/contact" element={
                    <LanguageLayout>
                      <ContactUs />
                    </LanguageLayout>
                  } />
                  
                  {/* Language-specific protected routes */}
                  <Route path="/:lang/dashboard" element={
                    <LanguageLayout>
                      <ProtectedRoute><Dashboard /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/projects" element={
                    <LanguageLayout>
                      <ProtectedRoute><Projects /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/clients" element={
                    <LanguageLayout>
                      <ProtectedRoute><Clients /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/invoices" element={
                    <LanguageLayout>
                      <ProtectedRoute><Invoices /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/create-invoice" element={
                    <LanguageLayout>
                      <ProtectedRoute><CreateInvoice /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/analytics" element={
                    <LanguageLayout>
                      <ProtectedRoute><Analytics /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/profile" element={
                    <LanguageLayout>
                      <ProtectedRoute><Profile /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/plans" element={
                    <LanguageLayout>
                      <ProtectedRoute><Plans /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/create-project" element={
                    <LanguageLayout>
                      <ProtectedRoute>
                        {({ user, profile }) => <CreateProject user={user} profile={profile} />}
                      </ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/edit-project/:slug" element={
                    <LanguageLayout>
                      <ProtectedRoute><EditProject /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/project/:slug" element={
                    <LanguageLayout>
                      <ProtectedRoute><ProjectManagement /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/templates" element={
                    <LanguageLayout>
                      <ProtectedRoute><ProjectTemplates /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  
                  {/* Backward compatibility redirects */}
                  <Route path="/login" element={<Navigate to="/en/login" replace />} />
                  <Route path="/signup" element={<Navigate to="/en/signup" replace />} />
                  <Route path="/email-confirmation" element={<Navigate to="/en/email-confirmation" replace />} />
                  <Route path="/forgot-password" element={<Navigate to="/en/forgot-password" replace />} />
                  <Route path="/reset-password" element={<Navigate to="/en/reset-password" replace />} />
                  <Route path="/contact" element={<Navigate to="/en/contact" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/en/dashboard" replace />} />
                  <Route path="/projects" element={<Navigate to="/en/projects" replace />} />
                  <Route path="/clients" element={<Navigate to="/en/clients" replace />} />
                  <Route path="/invoices" element={<Navigate to="/en/invoices" replace />} />
                  <Route path="/create-invoice" element={<Navigate to="/en/create-invoice" replace />} />
                  <Route path="/analytics" element={<Navigate to="/en/analytics" replace />} />
                  <Route path="/profile" element={<Navigate to="/en/profile" replace />} />
                  <Route path="/plans" element={<Navigate to="/en/plans" replace />} />
                  <Route path="/create-project" element={<Navigate to="/en/create-project" replace />} />
                  <Route path="/edit-project/*" element={<RedirectWithParams from="/edit-project" to="/en/edit-project" />} />
                  <Route path="/project/*" element={<RedirectWithParams from="/project" to="/en/project" />} />
                  <Route path="/templates" element={<Navigate to="/en/templates" replace />} />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </InvoiceProvider>
          </TooltipProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
