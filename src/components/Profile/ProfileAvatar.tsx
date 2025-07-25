
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  src: string | null;
  alt: string;
  fallbackText: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-24 h-24',
  lg: 'w-32 h-32'
};

export const ProfileAvatar = ({ 
  src, 
  alt, 
  fallbackText, 
  size = 'md' 
}: ProfileAvatarProps) => {
  return (
    <div className={`${sizeClasses[size]} mx-auto aspect-square`}>
      <Avatar className="w-full h-full rounded-full">
        {src && (
          <AvatarImage 
            src={src}
            alt={alt}
            className="object-cover object-center rounded-full"
          />
        )}
        <AvatarFallback className="bg-gray-100 text-gray-600 text-xl font-medium rounded-full">
          {fallbackText}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
