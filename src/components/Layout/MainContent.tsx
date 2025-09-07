
import React from 'react';
import { PageErrorBoundary } from '@/components/shared/ErrorBoundary';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <main 
      id="main-content"
      tabIndex={-1}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 focus:outline-none"
      role="main"
      aria-label="Main content"
    >
      <PageErrorBoundary>
        {children}
      </PageErrorBoundary>
    </main>
  );
};

export default MainContent;
