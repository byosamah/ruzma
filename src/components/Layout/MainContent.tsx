
import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {children}
    </main>
  );
};

export default MainContent;
