
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, TrendingUp, Shield } from 'lucide-react';

const WhyRecruitersSection: React.FC = () => {
  const benefits = [
    {
      icon: <Clock className="w-12 h-12 text-yellow-500 mb-4" />,
      title: "80% Faster Screening",
      description: "\"Ruzma reduced our screening time from 4 hours to 45 minutes per role. Game-changer!\"",
      author: "Sarah Martinez",
      role: "Senior Recruiter at TechFlow",
      company: "TechFlow Inc."
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-yellow-500 mb-4" />,
      title: "3x Better Quality Hires",
      description: "\"The AI matching is incredibly accurate. Our hire success rate increased dramatically.\"",
      author: "Michael Chen",
      role: "Head of Talent",
      company: "InnovateNow"
    },
    {
      icon: <Shield className="w-12 h-12 text-yellow-500 mb-4" />,
      title: "Zero Bias Hiring",
      description: "\"Ruzma helps us focus purely on skills and qualifications, creating fairer hiring processes.\"",
      author: "Emily Rodriguez",
      role: "Diversity & Inclusion Lead",
      company: "GlobalCorp"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Recruiters Love Ruzma
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of recruiting professionals who've transformed their hiring process with AI.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-100 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <blockquote className="text-gray-700 italic mb-6 text-lg">
                  {benefit.description}
                </blockquote>
                <div className="border-t border-gray-200 pt-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {benefit.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900">{benefit.author}</div>
                  <div className="text-sm text-gray-600">{benefit.role}</div>
                  <div className="text-sm text-gray-500">{benefit.company}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyRecruitersSection;
