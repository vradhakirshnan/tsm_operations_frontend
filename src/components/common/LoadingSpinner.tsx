import React from 'react';
import { ChefHat } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading Operational Dashboard...',
  subMessage = 'Connecting to KitchenOps Cloud Services...',
  fullScreen = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 max-w-sm text-center">
      <div className="relative">
        {/* Outer glowing spinning ring */}
        <div className="w-16 h-16 rounded-full border-4 border-surface-container-high border-t-secondary-container animate-spin" />
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          <ChefHat className="h-6 w-6 text-secondary animate-pulse" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-headline text-base font-bold text-on-surface">
          {message}
        </h3>
        <p className="font-body text-xs text-on-surface-variant">
          {subMessage}
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};
