import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import AIChatInterface from '@/components/AI/AIChatInterface';
import SEOHead from '@/components/SEO/SEOHead';

const AIChat: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <SEOHead 
        title="AI Chat - Ruzma"
        description="Chat with AI models powered by Hugging Face. Get help with your projects, content generation, and more."
      />
      <div className={`min-h-screen ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Assistant</h1>
            <p className="text-gray-600">
              Chat with powerful AI models to help with your projects, generate content, and get answers to your questions.
            </p>
          </div>
          
          <AIChatInterface />
        </div>
      </div>
    </>
  );
};

export default AIChat;