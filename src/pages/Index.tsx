
import React from 'react';
import HeroSection from "@/components/landing/HeroSection";
import TrustedLogos from "@/components/landing/TrustedLogos";
import InsightsCards from "@/components/landing/InsightsCards";
import TaskPrioritizationSection from "@/components/landing/TaskPrioritizationSection";
import CustomerInsightsSection from "@/components/landing/CustomerInsightsSection";
import SupportFeaturesSection from "@/components/landing/SupportFeaturesSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import FinalCtaSection from "@/components/landing/FinalCtaSection";

const Index = () => (
  <div className="bg-white min-h-screen font-sans">
    {/* Navbar (quick minimal) */}
    <header className="sticky top-0 z-10 bg-white border-b border-slate-100 py-3 px-0">
      <div className="container mx-auto px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Zaplytic Logo" className="h-8" />
          <span className="font-bold text-lg text-brand-black">Zaplytic</span>
        </div>
        <nav className="hidden md:flex gap-7 text-brand-black font-medium text-base">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Features</a>
          <a href="#" className="hover:underline">Pricing</a>
          <a href="#" className="hover:underline">About</a>
        </nav>
        <div className="flex gap-3">
          <a href="#" className="text-brand-black font-medium hover:underline">Sign in</a>
          <a href="#" className="rounded-lg bg-brand-black text-white px-4 py-2 font-bold hover:bg-brand-navy transition">Get started</a>
        </div>
      </div>
    </header>

    <main>
      <HeroSection />
      <TrustedLogos />
      <InsightsCards />
      <TaskPrioritizationSection />
      <CustomerInsightsSection />
      <SupportFeaturesSection />
      <IntegrationsSection />
      <FinalCtaSection />
    </main>

    {/* Minimal footer */}
    <footer className="bg-white border-t border-slate-100 py-6 mt-2 text-center text-xs text-brand-navy/50">
      © {new Date().getFullYear()} Zaplytic. All rights reserved.
    </footer>
  </div>
);

export default Index;
