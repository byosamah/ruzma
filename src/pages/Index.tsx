
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Briefcase, DollarSign, FileCheck, Shield, Zap, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/i18n';

// Language Selector component for landing page
const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  React.useEffect(() => {
    if (language === "ar") {
      document.documentElement.dir = "rtl";
      document.body.style.fontFamily = '"IBM Plex Sans Arabic", system-ui, sans-serif';
    } else {
      document.documentElement.dir = "ltr";
      document.body.style.fontFamily = '"IBM Plex Sans Arabic", system-ui, sans-serif';
    }
  }, [language]);
  return (
    <select
      value={language}
      onChange={e => setLanguage(e.target.value as "en" | "ar")}
      style={{ minWidth: 80 }}
      aria-label="Choose language"
      className="rounded border py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary mx-4 px-2"
    >
      <option value="en">English</option>
      <option value="ar">العربية</option>
    </select>
  );
};

const Index = () => {
  const t = useT();

  const features = [
    {
      icon: Briefcase,
      title: t('featureProjectManagementTitle'),
      description: t('featureProjectManagementDesc')
    },
    {
      icon: DollarSign,
      title: t('featurePaymentVerificationTitle'),
      description: t('featurePaymentVerificationDesc')
    },
    {
      icon: FileCheck,
      title: t('featureSecureDeliveryTitle'),
      description: t('featureSecureDeliveryDesc')
    },
    {
      icon: Shield,
      title: t('featureProfessionalPresentationTitle'),
      description: t('featureProfessionalPresentationDesc')
    },
    {
      icon: Zap,
      title: t('featureStreamlinedWorkflowTitle'),
      description: t('featureStreamlinedWorkflowDesc')
    },
    {
      icon: Users,
      title: t('featureClientFriendlyTitle'),
      description: t('featureClientFriendlyDesc')
    }
  ];

  const benefits = [
    t('benefit1'),
    t('benefit2'),
    t('benefit3'),
    t('benefit4'),
    t('benefit5'),
    t('benefit6')
  ];

  return (
    <div className="bg-white text-brand-black">
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-7" />
          </Link>
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <Link to="/login">
              <Button variant="ghost" className="text-brand-navy font-semibold hover:text-brand-blue">{t('login')}</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-brand-navy text-white font-semibold hover:bg-brand-black rounded-lg">{t('signUpFree')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black leading-tight tracking-tight">
                {t('landingHeroTitle')}
              </h1>
              <p className="mt-4 mb-8 text-lg text-brand-navy opacity-80 max-w-lg">
                {t('landingHeroSubtitle')}
              </p>
              <Link to="/signup">
                <Button size="lg" className="bg-brand-yellow text-brand-black font-bold rounded-lg px-8 h-14 text-base hover:bg-brand-yellow/90">
                  {t('getStartedFree')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl hidden md:block">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-base text-brand-black">{t('projectDashboard')}</p>
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-12 bg-slate-100 rounded-lg flex items-center px-4">
                    <p className="text-sm font-medium text-slate-500">{t('newWebsiteDesign')}</p>
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-8 w-24 bg-slate-100 rounded-lg"></div>
                    <div className="h-8 w-8 bg-brand-yellow rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50/70">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-black mb-4">{t('landingFeaturesTitle')}</h2>
            <p className="text-lg text-brand-navy/80 mb-12 max-w-3xl mx-auto">
              {t('landingFeaturesSubtitle')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={feature.title} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border-none p-4">
                    <CardHeader className="p-2">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-blue/10 mb-4">
                        <IconComponent className="w-6 h-6 text-brand-blue" />
                      </div>
                      <CardTitle className="text-lg font-bold text-brand-black">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <p className="text-brand-navy/70 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="bg-brand-navy p-8 rounded-2xl">
              <div className="rounded-xl bg-brand-black p-8 text-white flex flex-col gap-4 shadow-2xl">
                <div>
                  <span className="block text-sm font-semibold text-brand-yellow tracking-wider">{t('exampleProject')}</span>
                  <h3 className="text-xl font-bold mt-1 mb-3">{t('websiteDesign')}</h3>
                </div>
                <div className="bg-white/10 rounded-full h-2.5 w-full shadow-inner">
                  <div className="rounded-full h-2.5 bg-gradient-to-r from-brand-yellow to-brand-blue w-2/3" />
                </div>
                <div className="space-y-3 text-white/90 text-sm pt-2">
                  <div className="flex justify-between items-center">
                    <span>{t('designMockup')}</span>
                    <CheckCircle className="w-5 h-5 text-brand-yellow" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('development')}</span>
                    <CheckCircle className="w-5 h-5 text-brand-yellow" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('finalDelivery')}</span>
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-yellow/80"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-black">
                {t('landingWhyTitle')}
              </h2>
              <p className="mt-4 mb-6 text-lg text-brand-navy/80">
                {t('landingWhySubtitle')}
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-brand-blue flex-shrink-0 mt-0.5" />
                    <span className="text-brand-navy font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA section */}
        <section className="bg-brand-navy">
          <div className="container mx-auto px-6 py-20 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-white mb-5">
              {t('landingCtaTitle')}
            </h2>
            <p className="text-xl max-w-2xl mx-auto mb-9 text-white/80">
              {t('landingCtaSubtitle')}
            </p>
            <Link to="/signup">
              <Button size="lg" className="px-8 h-14 text-lg font-bold rounded-lg bg-brand-yellow text-brand-black hover:bg-white">
                {t('startYourFirstProject')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-brand-black text-white">
        <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-7 opacity-80" />
          </div>
          <p className="text-sm text-white/50">{t('footerRights', { year: new Date().getFullYear().toString() })}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
