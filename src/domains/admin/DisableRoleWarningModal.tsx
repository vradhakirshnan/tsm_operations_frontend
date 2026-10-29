import React, { useState } from 'react';
import { X, AlertTriangle, Power, Loader2, Users } from 'lucide-react';

interface DisableRoleWarningModalProps {
  isOpen: boolean;
  roleId: string | null;
  roleName: string;
  userCount: number;
  onClose: () => void;
  onConfirmDisable: (roleId: string) => Promise<void> | void;
}

export const DisableRoleWarningModal: React.FC<DisableRoleWarningModalProps> = ({
  isOpen,
  roleId,
  roleName,
  userCount,
  onClose,
  onConfirmDisable,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !roleId) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmDisable(roleId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Line */}
        <div className="h-1.5 w-full bg-error" />

        {/* Modal Header */}
        <div className="p-4 bg-surface-container-low border-b border-surface-container flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-error-container text-error">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface">
                Disable Operational Role
              </h3>
              <p className="font-body text-xs text-on-surface-variant">
                Role ID: <span className="font-mono">{roleId}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-3.5">
          <div className="text-sm text-on-surface space-y-2">
            <p>
              Are you sure you want to disable the role{' '}
              <strong className="text-primary font-bold">"{roleName}"</strong>?
            </p>

            {userCount > 0 ? (
              <div className="p-3.5 rounded-xl bg-error-container/80 text-on-error-container text-xs flex items-start gap-2.5 border border-error/30">
                <Users className="h-4 w-4 text-error shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Active Staff Warning</p>
                  <p className="mt-0.5 leading-relaxed">
                    <strong>{userCount} active {userCount === 1 ? 'user' : 'users'}</strong> currently{' '}
                    {userCount === 1 ? 'has' : 'have'} this role assigned. Disabling this role will disable it for these users across all kitchen station terminals.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-xs border border-surface-container">
                No active users are currently assigned to this role. Disabling it will move it to the Inactive Roles archive.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-headline text-xs font-bold hover:bg-surface-container-high transition-colors min-h-[38px]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error text-on-error font-headline text-xs font-bold hover:bg-error/90 transition-all active:scale-95 shadow-md disabled:opacity-50 min-h-[38px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                <span>Disabling...</span>
              </>
            ) : (
              <>
                <Power className="h-3.5 w-3.5" />
                <span>Confirm Disable</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
