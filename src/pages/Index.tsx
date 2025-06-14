import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { CheckCircle, Shield, Zap, Users, ArrowRight, Briefcase, DollarSign, FileCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: t('index.featureProjectManagement'),
      description: t('index.featureProjectManagementDesc')
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: t('index.featurePaymentVerification'),
      description: t('index.featurePaymentVerificationDesc')
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: t('index.featureSecureDelivery'),
      description: t('index.featureSecureDeliveryDesc')
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('index.featureProfessionalPresentation'),
      description: t('index.featureProfessionalPresentationDesc')
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('index.featureStreamlinedWorkflow'),
      description: t('index.featureStreamlinedWorkflowDesc')
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('index.featureClientFriendly'),
      description: t('index.featureClientFriendlyDesc')
    }
  ];

  const benefits = [
    t('index.benefit1'),
    t('index.benefit2'),
    t('index.benefit3'),
    t('index.benefit4'),
    t('index.benefit5'),
    t('index.benefit6')
  ];

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              {t('index.heroTitle1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {t('index.heroTitle2')}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('index.heroSubtitle')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup">
              <Button size="lg" className="px-8 py-3 text-lg">
                {t('index.getStartedButton')}
                <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                {t('index.signInButton')}
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('index.featuresTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('index.featuresSubtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto text-white">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-muted rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                {t('index.benefitsTitle')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('index.benefitsSubtitle')}
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('index.milestoneProjectName')}</span>
                      <span className="text-sm font-medium text-secondary">{t('index.milestoneProgress')}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full w-2/3"></div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{t('index.milestone1')}</span>
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex justify-between">
                        <span>{t('index.milestone2')}</span>
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex justify-between">
                        <span>{t('index.milestone3')}</span>
                        <div className="w-4 h-4 rounded-full border-2 border-border"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold">
            {t('index.ctaTitle')}
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            {t('index.ctaSubtitle')}
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg bg-white text-foreground hover:bg-slate-100">
              {t('index.ctaButton')}
              <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
            </Button>
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
