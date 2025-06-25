
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";

const queryClient = new QueryClient();

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Profile = lazy(() => import("./pages/Profile"));
const Projects = lazy(() => import("./pages/Projects"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const EditProject = lazy(() => import("./pages/EditProject"));
const ProjectManagement = lazy(() => import("./pages/ProjectManagement"));
const ClientProject = lazy(() => import("./pages/ClientProject"));
const Clients = lazy(() => import("./pages/Clients"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ProjectTemplates = lazy(() => import("./pages/ProjectTemplates"));
const Plans = lazy(() => import("./pages/Plans"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Invoices = lazy(() => import("./pages/Invoices"));
const CreateInvoice = lazy(() => import("./pages/CreateInvoice"));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <InvoiceProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/create-project" element={<CreateProject />} />
                  <Route path="/edit-project/:id" element={<EditProject />} />
                  <Route path="/project/:id" element={<ProjectManagement />} />
                  <Route path="/client/:token" element={<ClientProject />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/templates" element={<ProjectTemplates />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/create-invoice" element={<CreateInvoice />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </InvoiceProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
