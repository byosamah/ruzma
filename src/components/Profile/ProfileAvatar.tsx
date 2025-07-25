
import React from 'react';

interface ProfileAvatarProps {
  src: string | null;
  alt: string;
  fallbackText: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizePixels = {
  sm: 48,
  md: 96,
  lg: 128
};

export const ProfileAvatar = ({ 
  src, 
  alt, 
  fallbackText, 
  size = 'md' 
}: ProfileAvatarProps) => {
  console.log('ProfileAvatar rendering with src:', src);
  
  const sizeInPx = sizePixels[size];
  
  return (
    <div className="mx-auto" style={{ width: sizeInPx, height: sizeInPx }}>
      <div 
        className="relative bg-gray-100 flex items-center justify-center text-gray-600 font-medium border-2 border-gray-200"
        style={{
          width: `${sizeInPx}px`,
          height: `${sizeInPx}px`,
          borderRadius: `${sizeInPx / 2}px`,
          overflow: 'hidden',
          fontSize: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px'
        }}
      >
        {src ? (
          <img 
            src={src}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            onLoad={() => console.log('Avatar image loaded successfully')}
            onError={() => console.log('Avatar image failed to load')}
            style={{
              width: `${sizeInPx}px`,
              height: `${sizeInPx}px`
            }}
          />
        ) : (
          <span className="relative z-10">{fallbackText}</span>
        )}
      </div>
    </div>
  );
};
