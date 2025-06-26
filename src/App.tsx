
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <InvoiceProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/client/:token" element={<ClientProject />} />
                <Route path="/client/project/:token" element={<ClientProject />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                <Route path="/create-invoice" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
                <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
                <Route path="/edit-project/:slug" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
                <Route path="/project/:slug" element={<ProtectedRoute><ProjectManagement /></ProtectedRoute>} />
                <Route path="/templates" element={<ProtectedRoute><ProjectTemplates /></ProtectedRoute>} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </InvoiceProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
