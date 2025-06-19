
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AIInsightsSection: React.FC = () => {
  const performanceData = [
    { month: 'Jan', hires: 12, applications: 150 },
    { month: 'Feb', hires: 18, applications: 180 },
    { month: 'Mar', hires: 25, applications: 200 },
    { month: 'Apr', hires: 32, applications: 220 },
  ];

  const skillsData = [
    { name: 'Perfect Match', value: 35, color: '#EAB308' },
    { name: 'Good Fit', value: 45, color: '#FCD34D' },
    { name: 'Potential', value: 15, color: '#FEF3C7' },
    { name: 'Not Suitable', value: 5, color: '#F3F4F6' },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Insights & Analytics
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Make data-driven hiring decisions with real-time analytics and intelligent recommendations.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Hiring Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hires" fill="#EAB308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Candidate Quality Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={skillsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {skillsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black rounded-2xl shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg font-semibold">Match Accuracy</div>
              <div className="text-sm opacity-80 mt-2">AI-powered candidate scoring</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl shadow-lg border border-yellow-200">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">-80%</div>
              <div className="text-lg font-semibold text-gray-900">Time to Hire</div>
              <div className="text-sm text-gray-600 mt-2">Faster screening & matching</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-2xl shadow-lg border border-yellow-200">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">60%</div>
              <div className="text-lg font-semibold text-gray-900">Response Rate</div>
              <div className="text-sm text-gray-600 mt-2">Personalized outreach</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AIInsightsSection;
