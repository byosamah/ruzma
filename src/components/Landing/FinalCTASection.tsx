
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';

const FinalCTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-black">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Supercharge Your Hiring with Ruzma Today!
            </h2>
            <p className="text-xl mb-8 leading-relaxed opacity-90">
              Start automating your recruitment with AI. Join thousands of recruiters who've transformed their hiring process and reduced time-to-hire by 80%.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-4 text-lg rounded-full font-semibold bg-white/10 backdrop-blur-sm"
              >
                <Calendar className="mr-2 w-5 h-5" />
                Book a Demo
              </Button>
            </div>
            
            <div className="flex items-center text-black/80">
              <div className="flex -space-x-2 mr-4">
                {['JW', 'DP', 'MS', 'RK'].map((initials, index) => (
                  <div key={index} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sm font-semibold text-yellow-600 border-2 border-yellow-300">
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="font-semibold">Join 500+ recruiting teams</div>
                <div className="opacity-80">Free 14-day trial • No setup fees</div>
              </div>
            </div>
          </div>
          
          <div className="lg:text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-sm text-gray-500">Ruzma Dashboard</div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Positions</span>
                    <span className="font-bold text-yellow-600">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Candidates Screened</span>
                    <span className="font-bold text-yellow-600">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Successful Hires</span>
                    <span className="font-bold text-yellow-600">89</span>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="text-sm text-yellow-800 font-medium">Today's Recommendations</div>
                    <div className="text-xs text-yellow-700 mt-1">3 high-potential candidates for Senior Developer role</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
