
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { CheckCircle, Shield, Zap, Users, ArrowRight, Briefcase, DollarSign, FileCheck } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Project Management',
      description: 'Organize your freelance projects with clear milestones and deliverables.'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Payment Verification',
      description: 'Verify client payments before releasing deliverables automatically.'
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: 'Secure Delivery',
      description: 'Share files securely with clients through protected download links.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Professional Presentation',
      description: 'Auto-generated client pages that look professional and trustworthy.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Streamlined Workflow',
      description: 'Reduce back-and-forth emails with an automated approval process.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Client-Friendly',
      description: 'Simple interface for clients to make payments and access deliverables.'
    }
  ];

  const benefits = [
    'Never chase payments again',
    'Protect your work until payment',
    'Professional client experience',
    'Automated milestone tracking',
    'Secure file sharing',
    'Easy project management'
  ];

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 leading-tight">
              Freelance Deliverables
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Manage your freelance projects with confidence. Verify payments, track milestones, 
              and deliver work securely to clients through professional project pages.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Everything You Need to Manage Projects
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Streamline your freelance workflow with tools designed for professional project delivery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto text-white">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-800">
                Why Freelancers Choose Ruzma
              </h2>
              <p className="text-lg text-slate-600">
                Built specifically for freelancers who want to protect their work and 
                provide a professional experience for clients.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Website Design Project</span>
                      <span className="text-sm font-medium text-green-600">2/3 Milestones Complete</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-2/3"></div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Design Mockup</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex justify-between">
                        <span>Development</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex justify-between">
                        <span>Final Delivery</span>
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold">
            Ready to Streamline Your Freelance Workflow?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join thousands of freelancers who trust Ruzma to manage their projects and payments.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg bg-white text-slate-800 hover:bg-slate-100">
              Start Your First Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
