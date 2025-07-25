
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
  console.log('ProfileAvatar rendering with src:', src);
  
  return (
    <div className={`${sizeClasses[size]} mx-auto`}>
      <div className="w-full h-full aspect-square rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <Avatar className="w-full h-full">
          {src && (
            <AvatarImage 
              src={src}
              alt={alt}
              onLoad={() => console.log('Avatar image loaded successfully')}
              onError={() => console.log('Avatar image failed to load')}
            />
          )}
          <AvatarFallback className="bg-gray-100 text-gray-600 text-xl font-medium w-full h-full flex items-center justify-center">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};
