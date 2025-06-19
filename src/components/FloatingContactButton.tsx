
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const FloatingContactButton = () => {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/contact">
            <Button 
              size="icon" 
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-brand-yellow hover:bg-yellow-500 text-brand-black border-0 active:scale-95"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Contact Us</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default FloatingContactButton;
