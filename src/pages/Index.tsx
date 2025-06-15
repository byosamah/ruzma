
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { CheckCircle, ArrowRight, Briefcase, DollarSign, FileCheck, Shield, Zap, Users } from 'lucide-react';

const PALETTE = {
  blue: "#4B72E5",
  navy: "#1D3770",
  black: "#070E1B",
  yellow: "#FFD424",
  white: "#FFFFFF"
};

const Index = () => {
  const features = [
    {
      icon: <Briefcase className="w-6 h-6 text-[#FFD424]" />,
      title: 'Project Management',
      description: 'Organize your freelance projects with clear milestones and deliverables.'
    },
    {
      icon: <DollarSign className="w-6 h-6 text-[#4B72E5]" />,
      title: 'Payment Verification',
      description: 'Verify client payments before releasing deliverables automatically.'
    },
    {
      icon: <FileCheck className="w-6 h-6 text-[#1D3770]" />,
      title: 'Secure Delivery',
      description: 'Share files securely with clients through protected download links.'
    },
    {
      icon: <Shield className="w-6 h-6 text-[#070E1B]" />,
      title: 'Professional Presentation',
      description: 'Auto-generated client pages that look professional and trustworthy.'
    },
    {
      icon: <Zap className="w-6 h-6 text-[#FFD424]" />,
      title: 'Streamlined Workflow',
      description: 'Reduce back-and-forth emails with an automated approval process.'
    },
    {
      icon: <Users className="w-6 h-6 text-[#4B72E5]" />,
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
      {/* HERO */}
      <section
        className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        style={{
          background: `linear-gradient(108deg, ${PALETTE.blue} 0%, ${PALETTE.navy} 45%, ${PALETTE.black} 85%)`
        }}
      >
        {/* Subtle background accent */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <svg width="100%" height="100%" className="absolute left-0 top-0" style={{opacity: 0.05}}>
            <rect width="100%" height="100%" fill={PALETTE.yellow} />
          </svg>
        </div>
        <div className="relative z-10 mx-auto">
          <h1 className="text-[2.8rem] md:text-[4rem] font-extrabold leading-tight tracking-tight" style={{color: PALETTE.yellow}}>
            Freelance Deliverables,<br /><span className="bg-clip-text text-transparent" style={{backgroundImage: `linear-gradient(90deg, ${PALETTE.yellow} 0%, ${PALETTE.white} 45%, ${PALETTE.blue} 85%)`}}>Made Simple</span>
          </h1>
          <p className="mt-4 mb-10 text-xl md:text-2xl max-w-3xl mx-auto font-medium text-white/90">
            Manage your freelance projects with confidence.<br />
            <span className="block text-white/70 text-lg mt-1">
              Verify payments, track milestones, and deliver work securely through stunning project pages.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-3">
            <Link to="/signup">
              <Button size="lg" className="px-8 py-3 text-lg font-bold rounded-xl shadow-md bg-[#FFD424] text-black hover:bg-[#f8c700] hover:scale-105 transition-transform">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white px-8 py-3 text-lg font-bold rounded-xl hover:bg-white/20 hover:text-yellow-400 hover:scale-105 transition-transform">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-20 bg-[#FFD424] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%">
            <rect width="100%" height="100%" fill="#FFD424" />
            <ellipse cx="70%" cy="80%" rx="120" ry="40" fill="#1D3770" opacity={0.07} />
          </svg>
        </div>
        <div className="relative max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3770] text-center mb-6">Everything You Need, Beautifully</h2>
          <p className="text-lg md:text-xl text-[#1D3770]/85 text-center mb-12 max-w-2xl mx-auto">
            Streamline your freelance workflow with features designed for modern project delivery.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="rounded-2xl bg-white shadow-md group hover:shadow-xl transition-shadow border-none">
                <CardHeader>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl mx-auto shadow"
                    style={{
                      background: idx % 2 === 0
                        ? `linear-gradient(135deg, ${PALETTE.blue}, ${PALETTE.navy})`
                        : `linear-gradient(135deg, ${PALETTE.yellow}, ${PALETTE.blue})`
                    }}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg font-bold text-[#070E1B] mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#1D3770] text-sm opacity-80">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section
        className="py-20 relative"
        style={{
          background: `linear-gradient(87deg, white 60%, #4B72E5 100%)`
        }}
      >
        <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 px-2">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1D3770]">
              Why Freelancers Choose <span className="text-[#FFD424]">Ruzma</span>
            </h2>
            <p className="text-lg text-[#1D3770]/85">
              Built for freelancers who want to protect their work and wow their clients.
            </p>
            <ul className="space-y-3 mt-6">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full" style={{background: '#FFD424'}}>
                    <CheckCircle className="w-5 h-5 text-[#070E1B]" />
                  </span>
                  <span className="text-[#1D3770] font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl shadow-xl bg-[#1d3770] p-8 text-white flex flex-col gap-4">
            <div>
              <span className="block text-md font-semibold text-[#FFD424]">EXAMPLE PROJECT</span>
              <h3 className="text-xl font-bold mt-1 mb-3">Website Design</h3>
            </div>
            <div className="bg-white/10 rounded-full h-3 w-full mb-3 shadow-inner">
              <div className="rounded-full h-3 bg-gradient-to-r from-[#FFD424] via-[#4b72e5] to-[#070E1B] w-2/3 transition-all" />
            </div>
            <div className="space-y-2 text-white/90 text-sm">
              <div className="flex justify-between">
                <span>Design Mockup</span>
                <CheckCircle className="w-4 h-4 text-[#FFD424]" />
              </div>
              <div className="flex justify-between">
                <span>Development</span>
                <CheckCircle className="w-4 h-4 text-[#FFD424]" />
              </div>
              <div className="flex justify-between">
                <span>Final Delivery</span>
                <div className="w-4 h-4 rounded-full border-2 border-[#FFD424]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section
        className="py-20 text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(88deg, #FFD424 0%, #070E1B 70%, #1D3770 100%)`
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
          <svg width="100%" height="100%">
            <ellipse cx="10%" cy="60%" rx="120" ry="50" fill="#FFD424" opacity={0.07} />
            <ellipse cx="80%" cy="30%" rx="80" ry="40" fill="#4B72E5" opacity={0.09} />
          </svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-5">
            Ready to Level Up Your Freelance Workflow?
          </h2>
          <p className="text-xl max-w-lg mx-auto mb-9 text-yellow-200/90">
            Join thousands of freelancers who trust Ruzma to manage projects, get paid, and impress clients.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg font-bold rounded-xl bg-[#FFD424] text-black hover:bg-white">
              Start Your First Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

