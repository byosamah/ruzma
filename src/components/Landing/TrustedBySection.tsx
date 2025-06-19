
import React from 'react';

const TrustedBySection: React.FC = () => {
  const companies = [
    { name: 'TechCorp', logo: '🏢' },
    { name: 'InnovateHR', logo: '🚀' },
    { name: 'GlobalTech', logo: '🌐' },
    { name: 'StartupVentures', logo: '💡' },
    { name: 'Enterprise Solutions', logo: '🏭' },
    { name: 'Digital Dynamics', logo: '⚡' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gray-500 text-lg font-medium">Trusted by 500+ recruitment teams worldwide</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {companies.map((company, index) => (
            <div key={index} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="text-3xl mb-2">{company.logo}</div>
              <div className="text-gray-600 text-sm font-medium">{company.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;
