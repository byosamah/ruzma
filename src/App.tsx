import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import ClientProject from "./pages/ClientProject";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProjectManagement from "./pages/ProjectManagement";
import EditProject from "./pages/EditProject";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import React from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSupabaseAuth();
  const location = window.location.pathname;
  if (loading) return <div>Loading...</div>;
  // Public pages
  if (
    ["/login", "/signup", "/", "/forgot-password"].includes(location) ||
    location.startsWith("/client/")
  )
    return <>{children}</>;
  // Block access if not signed in
  if (!user) {
    window.location.href = "/login";
    return null;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/project/:projectId" element={<ProjectManagement />} />
            <Route path="/edit-project/:projectId" element={<EditProject />} />
            <Route path="/client/project/:projectId" element={<ClientProject />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProtectedRoute>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
