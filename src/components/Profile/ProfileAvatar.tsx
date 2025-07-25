
import React from 'react';

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
      <div 
        className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-600 text-xl font-medium overflow-hidden"
        style={{
          borderRadius: '50%',
          aspectRatio: '1/1'
        }}
      >
        {src ? (
          <img 
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onLoad={() => console.log('Avatar image loaded successfully')}
            onError={() => console.log('Avatar image failed to load')}
          />
        ) : (
          fallbackText
        )}
      </div>
    </div>
  );
};
