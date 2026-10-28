import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface StatusPopupProps {
  isOpen: boolean;
  type: 'success' | 'failure';
  title: string;
  message: string;
  onClose: () => void;
  actionLabel?: string;
}

export const StatusPopup: React.FC<StatusPopupProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  actionLabel = 'Acknowledge & Refresh',
}) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 border border-outline-variant/30 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Status Icon */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
            isSuccess
              ? 'bg-tertiary-fixed text-on-tertiary-fixed shadow-tertiary-fixed/30'
              : 'bg-error-container text-error shadow-error-container/40'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-8 w-8 text-on-tertiary-fixed-variant" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-error" />
          )}
        </div>

        {/* Text */}
        <div className="space-y-1.5 px-2">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            {title}
          </h3>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            {message}
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-headline text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
            isSuccess
              ? 'bg-primary text-on-primary hover:bg-inverse-surface'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
          }`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};
