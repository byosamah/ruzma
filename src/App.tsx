
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Plans from "./pages/Plans";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import ProjectManagement from "./pages/ProjectManagement";
import ProjectTemplates from "./pages/ProjectTemplates";
import ClientProject from "./pages/ClientProject";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import Clients from "./pages/Clients";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <InvoiceProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/create-invoice" element={<CreateInvoice />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/create-project" element={<CreateProject />} />
                <Route path="/edit-project/:slug" element={<EditProject />} />
                <Route path="/project/:slug" element={<ProjectManagement />} />
                <Route path="/templates" element={<ProjectTemplates />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/client/:token" element={<ClientProject />} />
                <Route path="/client/project/:token" element={<ClientProject />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </InvoiceProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
