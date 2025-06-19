
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How does Ruzma work?",
      answer: "Ruzma uses advanced AI algorithms to analyze resumes, job descriptions, and candidate profiles. It automatically screens applications, ranks candidates based on your criteria, and provides detailed insights to help you make better hiring decisions. The system learns from your preferences to improve accuracy over time."
    },
    {
      question: "Can I integrate Ruzma with my existing ATS?",
      answer: "Yes! Ruzma seamlessly integrates with popular ATS platforms including Workday, Greenhouse, Lever, and BambooHR. We also offer API access for custom integrations. Our team will help you set up the integration during onboarding."
    },
    {
      question: "Is Ruzma GDPR compliant?",
      answer: "Absolutely. Ruzma is fully GDPR compliant and follows strict data protection standards. We use enterprise-grade security, encrypt all data, and provide complete audit trails. Candidates' personal information is protected and processed according to privacy regulations."
    },
    {
      question: "What support do you offer?",
      answer: "We provide comprehensive support including 24/7 technical assistance, dedicated customer success managers, training sessions, and extensive documentation. Our team is always available to help you maximize the value of Ruzma for your recruitment process."
    },
    {
      question: "How accurate is the AI matching?",
      answer: "Our AI matching achieves 95% accuracy in candidate-job fit scoring. The system continuously learns from feedback and hiring outcomes to improve its recommendations. Most users see significant improvements in hire quality within the first month."
    },
    {
      question: "What's the typical ROI?",
      answer: "Most customers see ROI within 60 days through reduced time-to-hire (80% faster), improved hire quality (3x better retention), and decreased recruiting costs. The average customer saves 25 hours per week on manual screening tasks."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Ruzma and how it can transform your hiring process.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-yellow-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
