
import React from 'react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/Landing/HeroSection';
import TrustedBySection from '@/components/Landing/TrustedBySection';
import FeaturesSection from '@/components/Landing/FeaturesSection';
import WhyRecruitersSection from '@/components/Landing/WhyRecruitersSection';
import AIInsightsSection from '@/components/Landing/AIInsightsSection';
import TestimonialsSection from '@/components/Landing/TestimonialsSection';
import FAQSection from '@/components/Landing/FAQSection';
import FinalCTASection from '@/components/Landing/FinalCTASection';

const Landing: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <WhyRecruitersSection />
        <AIInsightsSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </div>
    </Layout>
  );
};

export default Landing;
