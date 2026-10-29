import React, { useState, useEffect } from 'react';
import { X, ShieldPlus, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRole: (roleName: string) => Promise<void> | void;
}

export const AddRoleModal: React.FC<AddRoleModalProps> = ({
  isOpen,
  onClose,
  onSaveRole,
}) => {
  const [roleName, setRoleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRoleName('');
      setValidationError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = roleName.trim();
    if (!trimmed) {
      setValidationError('Please enter a role name.');
      return;
    }

    if (trimmed.length < 2) {
      setValidationError('Role name must be at least 2 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveRole(trimmed);
      onClose();
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to save role. Please try again.');
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
        className="relative w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 bg-surface-container-low border-b border-surface-container">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <ShieldPlus className="h-5 w-5 text-secondary" />
              <h3 className="font-headline text-base font-bold text-on-surface">
                Add New Operational Role
              </h3>
            </div>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              Create a new role title for kitchen station assignments.
            </p>
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
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3.5">
          {validationError && (
            <div className="p-2.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2 border border-error/20">
              <AlertTriangle className="h-4 w-4 text-error shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="newRoleNameInput"
              className="font-headline text-xs font-bold text-on-surface flex items-center justify-between"
            >
              <span>Role Name</span>
              <span className="text-[10px] text-secondary font-bold uppercase">Required</span>
            </label>
            <input
              id="newRoleNameInput"
              type="text"
              autoFocus
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. Line Cook, Pastry Chef"
              className="w-full h-11 px-3.5 bg-surface-container-lowest rounded-xl font-body text-sm text-on-surface placeholder:text-outline border border-outline-variant/50 focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-on-surface-variant text-xs border border-surface-container">
            <span className="w-2 h-2 rounded-full bg-secondary-container shrink-0" />
            <span className="text-[11px]">
              New roles default to Active status with 0 assigned staff.
            </span>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-headline text-xs font-bold hover:bg-surface-container-high transition-colors min-h-[38px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !roleName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold hover:bg-inverse-surface transition-all active:scale-95 shadow-md disabled:opacity-50 min-h-[38px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-tertiary-fixed" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-tertiary-fixed" />
                  <span>Save Role</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
