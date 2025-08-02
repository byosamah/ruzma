import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Phone, Globe, Calendar, Send, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@/types/shared';

interface CommunicationHubCardProps {
  freelancer: UserProfile;
  projectId: string;
  branding?: any;
}

const CommunicationHubCard: React.FC<CommunicationHubCardProps> = ({ 
  freelancer, 
  projectId, 
  branding 
}) => {
  const [messageType, setMessageType] = useState<'general' | 'urgent' | 'feedback'>('general');
  const [isMessageSent, setIsMessageSent] = useState(false);

  const communicationMethods = [
    {
      type: 'email',
      icon: Mail,
      label: 'Email',
      value: freelancer.email,
      color: 'blue',
      available: !!freelancer.email
    },
    {
      type: 'website',
      icon: Globe,
      label: 'Website',
      value: freelancer.website,
      color: 'green',
      available: !!freelancer.website
    }
  ];

  const messageTypes = [
    { 
      id: 'general', 
      label: 'General Question', 
      icon: MessageSquare,
      color: 'blue',
      description: 'Ask about project details or general inquiries'
    },
    { 
      id: 'urgent', 
      label: 'Urgent Matter', 
      icon: Calendar,
      color: 'red',
      description: 'Time-sensitive issues requiring immediate attention'
    },
    { 
      id: 'feedback', 
      label: 'Project Feedback', 
      icon: CheckCircle2,
      color: 'green',
      description: 'Share feedback or suggestions about deliverables'
    }
  ];

  const handleSendMessage = () => {
    // In a real implementation, this would send the message
    setIsMessageSent(true);
    setTimeout(() => setIsMessageSent(false), 3000);
  };

  return (
    <motion.section 
      className="bg-white border border-gray-200 rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-primary" />
        Communication Hub
      </h3>
      
      {/* Quick Contact Methods */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {communicationMethods.map(method => method.available && (
            <a
              key={method.type}
              href={method.type === 'email' ? `mailto:${method.value}` : method.value}
              target={method.type === 'website' ? '_blank' : undefined}
              rel={method.type === 'website' ? 'noopener noreferrer' : undefined}
              className={`flex items-center p-3 border border-${method.color}-200 rounded-lg hover:bg-${method.color}-50 transition-colors`}
            >
              <method.icon className={`w-4 h-4 mr-3 text-${method.color}-600`} />
              <div>
                <p className="text-sm font-medium text-gray-900">{method.label}</p>
                <p className="text-xs text-gray-500 truncate">
                  {method.type === 'website' 
                    ? method.value?.replace(/^https?:\/\//, '')
                    : method.value
                  }
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Message Center */}
      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Send a Message</h4>
        
        {isMessageSent ? (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h5 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h5>
            <p className="text-sm text-gray-600">
              Your message has been forwarded to the freelancer. They'll get back to you soon.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Message Type Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Message Type
              </label>
              <div className="grid grid-cols-1 gap-2">
                {messageTypes.map(type => (
                  <label
                    key={type.id}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      messageType === type.id 
                        ? `border-${type.color}-500 bg-${type.color}-50` 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="messageType"
                      value={type.id}
                      checked={messageType === type.id}
                      onChange={(e) => setMessageType(e.target.value as any)}
                      className="sr-only"
                    />
                    <type.icon className={`w-4 h-4 mr-3 mt-0.5 ${
                      messageType === type.id ? `text-${type.color}-600` : 'text-gray-400'
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${
                        messageType === type.id ? `text-${type.color}-900` : 'text-gray-900'
                      }`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Message Text */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Your Message
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
                placeholder={`Type your ${messageType} message here...`}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              className="w-full bg-primary text-primary-content py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </button>
          </div>
        )}
      </div>

      {/* Communication Guidelines */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 mb-2">Communication Guidelines</h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Responses typically within 24 hours during business days</li>
          <li>• Use "Urgent" type only for time-sensitive matters</li>
          <li>• Include specific details for faster resolution</li>
          <li>• All communication is private and professional</li>
        </ul>
      </div>
    </motion.section>
  );
};

export default CommunicationHubCard;