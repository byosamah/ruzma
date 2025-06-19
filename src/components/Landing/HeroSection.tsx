
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI Assistant for Recruiters
            <span className="block text-yellow-500">Automate Hiring with Confidence</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your recruitment process with AI-powered screening, matching, and communication. 
            Find the perfect candidates faster while reducing manual work by 80%.
          </p>
          
          {/* Central UI Mockup */}
          <div className="mb-12 relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="ml-4 text-sm text-gray-500">Ruzma AI Assistant</div>
              </div>
              <div className="text-left space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">AI Analysis Complete</div>
                  <div className="text-lg font-semibold text-gray-900">Found 12 qualified candidates for Senior Developer role</div>
                  <div className="text-sm text-yellow-600 mt-2">• 8 exact skill matches • 4 high-potential candidates</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="text-sm text-yellow-800 font-medium">Top Recommendation</div>
                  <div className="text-gray-900 mt-1">Sarah Chen - 95% match score, 5+ years React experience</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Try for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-gray-300 hover:border-yellow-500 px-8 py-4 text-lg rounded-full font-semibold"
            >
              <Play className="mr-2 w-5 h-5" />
              Request a Demo
            </Button>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-300 rounded-full opacity-30 blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-yellow-100 rounded-full opacity-40 blur-xl"></div>
      </div>
    </section>
  );
};

export default HeroSection;
