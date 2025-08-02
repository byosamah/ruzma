
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LanguageLayout } from "@/components/LanguageLayout";
import { RedirectWithParams } from "@/components/RedirectWithParams";
import { useEffect } from "react";
import * as LazyRoutes from "./routes";
import { preloadCriticalRoutes } from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Preload critical routes on app start
  useEffect(() => {
    preloadCriticalRoutes();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <InvoiceProvider>
              <Routes>
                  {/* Root redirect - handled by LanguageProvider */}
                  <Route path="/" element={<Navigate to="/en/dashboard" replace />} />
                  
                   {/* Language-agnostic routes */}
                  <Route path="/client/:token" element={<LazyRoutes.ClientProject />} />
                  <Route path="/client/project/:token" element={<LazyRoutes.ClientProject />} />
                  <Route path="/contract/approve/:token" element={<LazyRoutes.ContractApproval />} />
                  
                  {/* Language-specific auth routes */}
                  <Route path="/:lang/login" element={
                    <LanguageLayout>
                      <LazyRoutes.Login />
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/signup" element={
                    <LanguageLayout>
                      <LazyRoutes.SignUp />
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/forgot-password" element={
                    <LanguageLayout>
                      <LazyRoutes.ForgotPassword />
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/reset-password" element={
                    <LanguageLayout>
                      <LazyRoutes.ResetPassword />
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/contact" element={
                    <LanguageLayout>
                      <LazyRoutes.ContactUs />
                    </LanguageLayout>
                  } />
                  
                  {/* Language-specific protected routes */}
                  <Route path="/:lang/dashboard" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.Dashboard /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/projects" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.Projects /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/clients" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.Clients /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/invoices" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.Invoices /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/create-invoice" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.CreateInvoice /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/analytics" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.Analytics /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/profile" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.Profile /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/plans" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.Plans /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/create-project" element={
                    <LanguageLayout>
                      <ProtectedRoute>
                        {({ user, profile }) => <LazyRoutes.CreateProject user={user} profile={profile} />}
                      </ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/edit-project/:slug" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.EditProject /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/project/:slug" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.ProjectManagement /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  <Route path="/:lang/templates" element={
                    <LanguageLayout>
                      <ProtectedRoute><LazyRoutes.ProjectTemplates /></ProtectedRoute>
                    </LanguageLayout>
                  } />
                  
                  {/* Backward compatibility redirects */}
                  <Route path="/login" element={<Navigate to="/en/login" replace />} />
                  <Route path="/signup" element={<Navigate to="/en/signup" replace />} />
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
                  <Route path="*" element={<LazyRoutes.NotFound />} />
                </Routes>
            </InvoiceProvider>
          </TooltipProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
