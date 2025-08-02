import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Globe, Building2, Star } from 'lucide-react';
import { UserProfile } from '@/types/shared';
import BrandedLogo from '@/components/ui/BrandedLogo';

interface FreelancerContactCardProps {
  freelancer: UserProfile;
  branding?: any;
}

const FreelancerContactCard: React.FC<FreelancerContactCardProps> = ({ freelancer, branding }) => {
  return (
    <motion.section 
      className="bg-white border border-gray-200 rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <User className="w-5 h-5 mr-2 text-primary" />
        Your Freelancer
      </h3>
      
      <div className="flex items-start space-x-4">
        {/* Avatar or Branded Logo */}
        <div className="flex-shrink-0">
          {freelancer.avatar_url ? (
            <img 
              src={freelancer.avatar_url} 
              alt={freelancer.full_name || 'Freelancer'}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <BrandedLogo 
              branding={branding}
              size="lg"
              showName={false}
              className="w-16 h-16"
              fallbackIcon={<User className="w-8 h-8 text-gray-400" />}
            />
          )}
        </div>
        
        {/* Freelancer Info */}
        <div className="flex-1">
          <div className="mb-4">
            <h4 className="text-xl font-semibold text-gray-900">
              {freelancer.full_name || 'Professional Freelancer'}
            </h4>
            {freelancer.company && (
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Building2 className="w-4 h-4 mr-1" />
                {freelancer.company}
              </p>
            )}
          </div>
          
          {freelancer.bio && (
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              {freelancer.bio}
            </p>
          )}
          
          {/* Contact Information */}
          <div className="space-y-2">
            {freelancer.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-blue-500" />
                <a 
                  href={`mailto:${freelancer.email}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {freelancer.email}
                </a>
              </div>
            )}
            
            {freelancer.website && (
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="w-4 h-4 mr-2 text-green-500" />
                <a 
                  href={freelancer.website.startsWith('http') ? freelancer.website : `https://${freelancer.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-600 transition-colors"
                >
                  {freelancer.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Professional Badge */}
        <div className="flex-shrink-0">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span className="text-xs font-medium">Pro</span>
          </div>
        </div>
      </div>
      
      {/* Trust Signal */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          💼 Professional freelancer committed to delivering quality work on time
        </p>
      </div>
    </motion.section>
  );
};

export default FreelancerContactCard;