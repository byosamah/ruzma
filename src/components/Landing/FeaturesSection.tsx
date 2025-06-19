
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch, Users, MessageSquare, Target } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <FileSearch className="w-8 h-8 text-yellow-500" />,
      title: "Instant Resume Screening",
      description: "AI analyzes hundreds of resumes in seconds, identifying top candidates based on your criteria."
    },
    {
      icon: <Target className="w-8 h-8 text-yellow-500" />,
      title: "Automated Job Matching",
      description: "Smart algorithms match candidates to roles with 95% accuracy, saving hours of manual review."
    },
    {
      icon: <Users className="w-8 h-8 text-yellow-500" />,
      title: "Smart Candidate Sourcing",
      description: "Discover hidden talent across multiple platforms with AI-powered candidate discovery."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-yellow-500" />,
      title: "Communication Assistant",
      description: "Automate candidate outreach with personalized messages that increase response rates by 60%."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Supercharge Your Recruitment Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to find, screen, and hire the best candidates faster than ever before.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
