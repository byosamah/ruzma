
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { ArrowRight, ShieldCheck, Users, FileCheck, Zap } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-brand-blue" />,
    title: 'Secure Client Delivery',
    description: 'Deliver milestone work and files securely—clients pay before accessing final assets.',
  },
  {
    icon: <FileCheck className="w-6 h-6 text-brand-navy" />,
    title: 'Track Projects Easily',
    description: 'See all your freelance projects, milestones, and client payments in one modern dashboard.',
  },
  {
    icon: <Zap className="w-6 h-6 text-brand-yellow" />,
    title: 'Automate Workflow',
    description: 'Automated emails, approvals, and smart reminders reduce back-and-forth.',
  },
  {
    icon: <Users className="w-6 h-6 text-brand-black" />,
    title: 'Professional Experience',
    description: 'Your clients get a polished portal that matches your branding and inspires trust.',
  }
];

const Index = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-5xl lg:max-w-6xl">
        {/* Hero Section */}
        <section className="py-16 flex flex-col items-center gap-8">
          {/* Logo */}
          <img src="/lovable-uploads/779e139d-0917-478b-b73d-7208764eaa3c.png" alt="Logo palette ref" className="w-14 h-14 rounded-md shadow-md mb-2" />

          <h1 className="text-[2.8rem] md:text-6xl text-center font-extrabold tracking-tight"
            style={{ color: 'hsl(var(--brand-black))' }}>
            Secure Freelance <span className="text-[hsl(var(--brand-yellow))]">Deliverables</span>
            <br />
            <span className="text-[hsl(var(--brand-blue))]">Made Effortless</span>
          </h1>
          <p className="max-w-xl text-center text-lg text-[hsl(var(--brand-navy))] font-medium">
            Protect your work & get paid – all in one portal for freelancers.
            Modern, trusted, simple. Send deliverables and only unlock them for your clients after they pay.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-3 flex-col sm:flex-row justify-center items-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-[hsl(var(--brand-yellow))] hover:bg-yellow-400 text-[hsl(var(--brand-black))] font-semibold text-lg shadow-lg px-10 py-4"
                style={{ borderRadius: '0.7rem' }}
              >
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-[hsl(var(--brand-blue))] text-[hsl(var(--brand-blue))] font-medium px-8 py-4"
                style={{ borderRadius: '0.7rem' }}
              >
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="my-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group p-7 rounded-lg border border-slate-100 shadow-[0_4px_32px_0_rgba(73,120,232,0.05)] transition-all bg-white hover:scale-[1.03] hover:shadow-xl hover:border-[hsl(var(--brand-yellow))]"
            >
              <div className="flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <div className="font-bold text-xl mb-2 text-[hsl(var(--brand-black))]">{f.title}</div>
              <div className="text-[hsl(var(--brand-navy))] text-base">{f.description}</div>
            </div>
          ))}
        </section>

        {/* How It Works */}
        <section className="py-14 px-6 md:px-16 mb-10 rounded-2xl bg-[hsl(var(--brand-blue))]/5 border border-slate-100">
          <h2 className="text-3xl font-bold text-center mb-6" style={{ color: 'hsl(var(--brand-blue))' }}>
            How it Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-14 h-14 rounded-full bg-[hsl(var(--brand-blue))] flex items-center justify-center mx-auto mb-4">
                <span className="text-[hsl(var(--brand-white))] font-bold text-2xl">1</span>
              </div>
              <p className="font-semibold text-lg mb-2 text-[hsl(var(--brand-black))]">Create Project & Milestones</p>
              <p className="text-[hsl(var(--brand-navy))] text-base">Set up your project, define deliverables and payment steps for your client.</p>
            </div>
            <div>
              <div className="w-14 h-14 rounded-full bg-[hsl(var(--brand-yellow))] flex items-center justify-center mx-auto mb-4">
                <span className="text-[hsl(var(--brand-black))] font-bold text-2xl">2</span>
              </div>
              <p className="font-semibold text-lg mb-2 text-[hsl(var(--brand-black))]">Upload & Share</p>
              <p className="text-[hsl(var(--brand-navy))] text-base">Upload files for your milestone. Client only gets access after payment.</p>
            </div>
            <div>
              <div className="w-14 h-14 rounded-full bg-[hsl(var(--brand-black))] flex items-center justify-center mx-auto mb-4">
                <span className="text-[hsl(var(--brand-yellow))] font-bold text-2xl">3</span>
              </div>
              <p className="font-semibold text-lg mb-2 text-[hsl(var(--brand-black))]">Automate & Relax</p>
              <p className="text-[hsl(var(--brand-navy))] text-base">Platform handles reminders, payment release, approval & client delivery page.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="text-center py-14 px-4 mt-10 rounded-2xl"
          style={{
            background:
              'linear-gradient(100deg, hsl(var(--brand-yellow)), hsl(var(--brand-blue)))',
          }}
        >
          <h2 className="font-extrabold text-3xl md:text-4xl mb-3 text-[hsl(var(--brand-black))] drop-shadow-[0_2px_1px_rgba(255,255,255,0.15)]">
            Join the New Era of Freelance Delivery
          </h2>
          <p className="mb-8 max-w-2xl mx-auto text-lg md:text-xl text-[hsl(var(--brand-black))]/80 font-medium">
            Sign up free and deliver your work with confidence. Trusted by modern freelancers.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-[hsl(var(--brand-black))] text-[hsl(var(--brand-yellow))] py-4 px-10 font-bold text-lg border-2 border-[hsl(var(--brand-yellow))] shadow-xl"
              style={{ borderRadius: '1rem' }}
            >
              Start Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
