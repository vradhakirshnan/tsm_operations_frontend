import React, { useState } from 'react';
import {
  X,
  BadgeCheck,
  Mail,
  User,
  Search,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Plus,
  Shield,
  CookingPot,
  Flame,
  Layers,
} from 'lucide-react';
import { AdminUser, AVAILABLE_ROLES } from './types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (userData: Omit<AdminUser, 'userId'>) => Promise<void> | void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSaveUser,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [roles, setRoles] = useState<string[]>([
    'Operations Executive',
    'Prep Station Lead',
  ]);
  const [roleSearch, setRoleSearch] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRemoveRole = (roleToRemove: string) => {
    setRoles((prev) => prev.filter((r) => r !== roleToRemove));
  };

  const handleAddRole = (roleToAdd: string) => {
    if (!roles.includes(roleToAdd)) {
      setRoles((prev) => [...prev, roleToAdd]);
    }
    setRoleSearch('');
    setShowRoleDropdown(false);
  };

  const filteredRoleSuggestions = AVAILABLE_ROLES.filter(
    (role) =>
      !roles.includes(role) &&
      role.toLowerCase().includes(roleSearch.toLowerCase().trim())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedName) {
      setValidationError('Please enter both Full Name and User Email.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setValidationError('Please enter a valid corporate email address.');
      return;
    }

    if (roles.length === 0) {
      setValidationError('Please assign at least one operational role.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveUser({
        userName: trimmedName,
        userEmail: trimmedEmail,
        enabled,
        roles,
        station: roles[0] || 'Central Kitchen',
      });
      onClose();
    } catch {
      setValidationError('Failed to save user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (roleName: string) => {
    const lower = roleName.toLowerCase();
    if (lower.includes('lead') || lower.includes('chef')) {
      return <Flame className="h-3.5 w-3.5 text-secondary-container" />;
    }
    if (lower.includes('manager') || lower.includes('management')) {
      return <Shield className="h-3.5 w-3.5 text-tertiary-fixed" />;
    }
    if (lower.includes('inventory')) {
      return <Layers className="h-3.5 w-3.5 text-tertiary-fixed-dim" />;
    }
    return <CookingPot className="h-3.5 w-3.5 text-surface-tint" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-surface-container-low px-5 py-4 border-b border-surface-container flex items-start justify-between">
          <div className="flex flex-col pr-2">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-secondary" />
              <h2 className="font-headline text-lg font-bold text-primary tracking-tight">
                Add New User
              </h2>
            </div>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              Create credentials and grant operational roles
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Enabled Switch */}
            <div className="flex items-center gap-2 bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-sm border border-outline-variant/30">
              <span
                className={`font-body text-[11px] font-bold uppercase tracking-wider ${
                  enabled ? 'text-on-tertiary-container' : 'text-outline'
                }`}
              >
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={`w-9 h-5 rounded-full relative p-0.5 transition-colors focus:outline-none ${
                  enabled ? 'bg-tertiary-container' : 'bg-outline-variant'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full shadow transition-transform transform ${
                    enabled
                      ? 'translate-x-4 bg-tertiary-fixed'
                      : 'translate-x-0 bg-surface-container-lowest'
                  }`}
                />
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Validation Notice Banner */}
          {validationError ? (
            <div className="bg-error-container/80 text-on-error-container px-3.5 py-2.5 rounded-xl flex items-start gap-2.5 shadow-sm text-xs border border-error/20">
              <AlertTriangle className="h-4 w-4 text-error shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Required Fields Notice</p>
                <p className="text-[11px] mt-0.5">{validationError}</p>
              </div>
            </div>
          ) : (
            <div className="bg-secondary-fixed/50 px-3.5 py-2.5 rounded-xl flex items-start gap-2.5 shadow-sm text-xs border border-secondary/20">
              <AlertTriangle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-on-secondary-fixed">
                  Required Fields Notice
                </span>
                <p className="text-on-secondary-fixed-variant text-[11px] mt-0.5">
                  All fields must be filled before saving credentials.
                </p>
              </div>
            </div>
          )}

          {/* User Email */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-primary">
              <label htmlFor="addUserEmail" className="flex items-center gap-1">
                <span>User Email</span>
                <span className="text-secondary font-bold">*</span>
              </label>
              <span className="text-[10px] text-secondary font-bold uppercase">
                Required
              </span>
            </div>
            <div className="relative flex items-center">
              <Mail className="h-4 w-4 absolute left-3 text-on-surface-variant pointer-events-none" />
              <input
                id="addUserEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef.name@kitchenops.io"
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-surface-container-lowest text-on-surface font-body text-sm border border-outline-variant/50 focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 focus:outline-none transition-all placeholder:text-outline-variant"
              />
            </div>
            <p className="text-[11px] text-on-surface-variant flex items-center gap-1 pt-0.5">
              <Lock className="h-3 w-3" />
              Required for kitchen system login
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-primary">
              <label htmlFor="addUserName" className="flex items-center gap-1">
                <span>Full Name</span>
                <span className="text-secondary font-bold">*</span>
              </label>
              <span className="text-[10px] text-secondary font-bold uppercase">
                Required
              </span>
            </div>
            <div className="relative flex items-center">
              <User className="h-4 w-4 absolute left-3 text-on-surface-variant pointer-events-none" />
              <input
                id="addUserName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-surface-container-lowest text-on-surface font-body text-sm border border-outline-variant/50 focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 focus:outline-none transition-all placeholder:text-outline-variant"
              />
            </div>
          </div>

          {/* Assigned Roles List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-primary flex items-center gap-1">
                <span>Assigned Roles</span>
                <span className="text-secondary font-bold">*</span>
              </label>
              <span className="text-on-surface-variant font-bold text-[11px]">
                {roles.length} Active
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-surface-container-low min-h-[46px] items-center border border-surface-container">
              {roles.length === 0 ? (
                <span className="text-xs text-outline italic px-1">
                  No roles assigned. Select from suggestions below.
                </span>
              ) : (
                roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg bg-primary-container text-on-primary text-xs font-medium shadow-sm"
                  >
                    {getRoleIcon(role)}
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role)}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 text-on-primary transition-colors ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Add Additional Roles Autocomplete */}
          <div className="space-y-1 relative">
            <label className="font-semibold text-xs text-primary">
              Add Role Authority
            </label>
            <div className="relative flex items-center">
              <Search className="h-4 w-4 absolute left-3 text-secondary pointer-events-none" />
              <input
                type="text"
                value={roleSearch}
                onFocus={() => setShowRoleDropdown(true)}
                onChange={(e) => {
                  setRoleSearch(e.target.value);
                  setShowRoleDropdown(true);
                }}
                placeholder="Search culinary roles to assign..."
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-surface-container-lowest text-on-surface font-body text-sm border border-outline-variant/50 focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 focus:outline-none transition-all placeholder:text-outline-variant"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showRoleDropdown && (
              <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl mt-1 overflow-hidden border border-surface-container z-20">
                <div className="px-3.5 py-2 bg-surface-container-high flex items-center justify-between text-[11px]">
                  <span className="font-bold text-on-surface-variant uppercase tracking-wider">
                    Culinary Registry Suggestions
                  </span>
                  <span className="text-secondary font-mono">
                    {filteredRoleSuggestions.length} matches
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-surface-container-low">
                  {filteredRoleSuggestions.length === 0 ? (
                    <div className="p-3 text-xs text-on-surface-variant text-center">
                      No matching roles available
                    </div>
                  ) : (
                    filteredRoleSuggestions.map((role) => (
                      <div
                        key={role}
                        className="flex items-center justify-between px-3.5 py-2 hover:bg-surface-container-low transition-colors group cursor-pointer"
                        onClick={() => handleAddRole(role)}
                      >
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role)}
                          <span className="text-xs font-semibold text-primary">
                            {role}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-md bg-secondary text-on-secondary text-[11px] font-bold flex items-center gap-1 shadow-sm hover:bg-secondary/90 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Modal Sticky Action Footer */}
        <div className="bg-surface-container-low px-5 py-4 border-t border-surface-container flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
            <Lock className="h-3 w-3 shrink-0" />
            <span>Save validates all inputs and assigns initial station permissions.</span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl bg-primary text-on-primary font-semibold text-xs flex items-center gap-2 shadow-md hover:bg-inverse-surface transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4 text-tertiary-fixed" />
              <span>{isSubmitting ? 'Saving...' : 'Save User'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
