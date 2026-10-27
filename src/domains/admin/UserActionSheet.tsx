import React from 'react';
import {
  X,
  Edit,
  KeyRound,
  History,
  Power,
  ShieldAlert,
} from 'lucide-react';
import { AdminUser } from './types';

interface UserActionSheetProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onEdit: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onResetPin?: (user: AdminUser) => void;
}

export const UserActionSheet: React.FC<UserActionSheetProps> = ({
  isOpen,
  user,
  onClose,
  onEdit,
  onToggleStatus,
  onResetPin,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle pill on mobile */}
        <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-1 sm:hidden" />

        {/* User Header in Modal */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex flex-col min-w-0 pr-2">
            <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface truncate">
              {user.userName}
            </h3>
            <span className="font-body text-xs text-on-surface-variant truncate">
              {user.userEmail}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                user.enabled
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                  : 'bg-error-container text-error'
              }`}
            >
              {user.enabled ? 'Active On Shift' : 'Disabled'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Action List */}
        <div className="flex flex-col gap-2">
          {/* Action 1: Edit Permissions & Roles */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(user);
            }}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-left transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-secondary-container/20 text-secondary group-hover:scale-105 transition-transform">
              <Edit className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-primary">
                Edit Permissions &amp; Roles
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Modify station matrix access and display title
              </span>
            </div>
          </button>

          {/* Action 2: Reset Kitchen PIN / Badge */}
          <button
            type="button"
            onClick={() => {
              if (onResetPin) onResetPin(user);
              onClose();
            }}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-left transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-surface-container text-on-surface-variant group-hover:scale-105 transition-transform">
              <KeyRound className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-primary">
                Reset Kitchen PIN / Badge
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Regenerate terminal bypass code and station token
              </span>
            </div>
          </button>

          {/* Action 3: View Shift Access History */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(user);
            }}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-left transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-surface-container text-outline group-hover:scale-105 transition-transform">
              <History className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-primary">
                View Shift Access History
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Inspect past station logins and HACCP temp logs
              </span>
            </div>
          </button>

          {/* Action 4: Deactivate / Activate Account */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onToggleStatus(user);
            }}
            className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-colors group cursor-pointer ${
              user.enabled
                ? 'bg-error-container/40 hover:bg-error-container text-error'
                : 'bg-tertiary-container/30 hover:bg-tertiary-container/50 text-tertiary'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                user.enabled
                  ? 'bg-error-container text-error'
                  : 'bg-tertiary-container text-on-tertiary-container'
              } group-hover:scale-105 transition-transform`}
            >
              {user.enabled ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <Power className="h-4 w-4" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">
                {user.enabled ? 'Deactivate Account' : 'Reactivate Account'}
              </span>
              <span className="text-[11px] opacity-80">
                {user.enabled
                  ? 'Revoke terminal access across all kitchen pods immediately'
                  : 'Restore kitchen terminal access and station credentials'}
              </span>
            </div>
          </button>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-surface-container text-on-surface font-semibold text-xs rounded-xl text-center hover:bg-surface-container-high transition-colors active:scale-98"
        >
          Done
        </button>
      </div>
    </div>
  );
};
