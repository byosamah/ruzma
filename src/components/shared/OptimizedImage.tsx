import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  lazy = true,
  placeholder,
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError && placeholder) {
    return (
      <div 
        className={cn("bg-muted flex items-center justify-center", className)}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">{placeholder}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      style={{
        ...(width && height && { aspectRatio: `${width}/${height}` })
      }}
    />
  );
};