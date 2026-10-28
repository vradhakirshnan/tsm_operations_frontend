import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertTriangle,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
  Power,
  Edit2,
  Shield,
  CookingPot,
  Flame,
  Layers,
  History,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react';
import { AdminUser, DEFAULT_ENABLED_ROLES_MOCK, resolveRoleId, resolveRoleName } from './types';
import { getAdminRolesApi } from '../../api/usersApi';

interface EditUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  isSelf?: boolean;
  onClose: () => void;
  onUpdateUser: (updated: AdminUser) => Promise<void> | void;
  onToggleStatus: (userId: string, enabled: boolean) => Promise<void> | void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  isSelf = false,
  onClose,
  onUpdateUser,
  onToggleStatus,
}) => {
  const [name, setName] = useState('');
  const [rolesMap, setRolesMap] = useState<Record<string, string>>(
    DEFAULT_ENABLED_ROLES_MOCK
  );
  const [assignedRoleIds, setAssignedRoleIds] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [editMode, setEditMode] = useState(!isSelf);
  const [showConfirmDisable, setShowConfirmDisable] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch enabled roles from backend and initialize user state
  useEffect(() => {
    if (isOpen && user) {
      setName(user.userName);
      setEnabled(user.enabled);
      setEditMode(!isSelf);
      setShowConfirmDisable(false);
      setSavedFeedback(false);
      setRoleSearch('');
      setShowRoleDropdown(false);

      const fetchRoles = async () => {
        setIsLoadingRoles(true);
        try {
          const res = await getAdminRolesApi('enabled');
          const latestRoles = res?.enabled && Object.keys(res.enabled).length > 0
            ? res.enabled
            : DEFAULT_ENABLED_ROLES_MOCK;
          setRolesMap(latestRoles);

          // Resolve user's existing roles to role IDs
          const initialIds = (user.roles || []).map((r) =>
            resolveRoleId(r, latestRoles)
          );
          setAssignedRoleIds(initialIds);
        } catch (err) {
          console.warn('Failed to fetch enabled roles for Edit User modal:', err);
          const initialIds = (user.roles || []).map((r) =>
            resolveRoleId(r, DEFAULT_ENABLED_ROLES_MOCK)
          );
          setAssignedRoleIds(initialIds);
        } finally {
          setIsLoadingRoles(false);
        }
      };

      fetchRoles();
    }
  }, [isOpen, user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || !user) return null;

  // Initial user role IDs for detecting changes
  const initialRoleIds = (user.roles || []).map((r) => resolveRoleId(r, rolesMap));

  // Check if there are unsaved changes
  const hasChanges =
    name.trim() !== user.userName ||
    enabled !== user.enabled ||
    JSON.stringify([...assignedRoleIds].sort()) !==
      JSON.stringify([...initialRoleIds].sort());

  // Available roles are all enabled roles EXCLUDING already assigned ones
  // For edit user: we remove all roles already assigned and show only the new ones
  const availableRoleEntries = Object.entries(rolesMap).filter(
    ([roleId]) => !assignedRoleIds.includes(roleId)
  );

  // Filter available suggestions by search
  const filteredRoleSuggestions = availableRoleEntries.filter(
    ([roleId, roleName]) => {
      const q = roleSearch.toLowerCase().trim();
      return (
        roleName.toLowerCase().includes(q) || roleId.toLowerCase().includes(q)
      );
    }
  );

  // When a user removes a role, it immediately returns to the available roles dropdown
  const handleRemoveRole = (roleIdToRemove: string) => {
    if (!editMode) return;
    setAssignedRoleIds((prev) => prev.filter((id) => id !== roleIdToRemove));
  };

  // When a user adds a role from the dropdown, it gets assigned and removed from dropdown
  const handleAddRole = (roleIdToAdd: string) => {
    if (!assignedRoleIds.includes(roleIdToAdd)) {
      setAssignedRoleIds((prev) => [...prev, roleIdToAdd]);
    }
    setRoleSearch('');
    setShowRoleDropdown(false);
  };

  const handleReset = () => {
    setName(user.userName);
    setAssignedRoleIds(initialRoleIds);
    setEnabled(user.enabled);
    setShowConfirmDisable(false);
  };

  const handleConfirmDisable = async () => {
    if (isSelf) return;
    setEnabled(false);
    setShowConfirmDisable(false);
    await onToggleStatus(user.userId, false);
  };

  const handleEnableUser = async () => {
    if (isSelf) return;
    setEnabled(true);
    await onToggleStatus(user.userId, true);
  };

  const handleSave = async () => {
    if (isSelf || !name.trim()) return;
    setIsSaving(true);
    try {
      // Send assigned role IDs to backend
      await onUpdateUser({
        ...user,
        userName: name.trim(),
        roles: assignedRoleIds,
        enabled,
      });
      setSavedFeedback(true);
      setTimeout(() => {
        setSavedFeedback(false);
        onClose();
      }, 700);
    } finally {
      setIsSaving(false);
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
        {/* Top Decorative Line Status Indicator */}
        <div
          className={`h-1.5 w-full ${
            enabled ? 'bg-secondary-container' : 'bg-outline-variant'
          }`}
        />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-surface-container-low border-b border-surface-container flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={user.avatarUrl}
                  alt={user.userName}
                  className="w-12 h-12 rounded-xl object-cover shadow-sm border border-outline-variant/40"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-surface-container-low ${
                    enabled ? 'bg-tertiary-fixed-dim' : 'bg-outline'
                  }`}
                />
              </div>

              <div className="flex flex-col min-w-0">
                <h2 className="font-headline text-base sm:text-lg font-bold text-on-surface truncate">
                  User Details: {user.userName}
                </h2>
                <p className="font-body text-xs text-on-surface-variant truncate">
                  ID: USR-{user.userId} • {user.lastUsed || 'Station Terminal #04'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action Status Header Strip: Status Indicator & Quick Toggle */}
          <div className="flex items-center justify-between bg-surface-container-lowest px-3 py-2 rounded-xl shadow-sm border border-surface-container">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface">
                <span
                  className={`w-2 h-2 rounded-full ${
                    enabled ? 'bg-tertiary-fixed-dim animate-pulse' : 'bg-outline'
                  }`}
                />
                <span>{enabled ? 'Active / Enabled' : 'Disabled / Inactive'}</span>
              </span>
              <span className="text-xs text-on-surface-variant hidden sm:inline">
                {user.station || 'Station Terminal #04'}
              </span>
            </div>

            {enabled ? (
              <button
                type="button"
                disabled={isSelf}
                onClick={() => {
                  if (isSelf) return;
                  setShowConfirmDisable(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                  isSelf
                    ? 'bg-surface-container opacity-45 cursor-not-allowed text-outline'
                    : 'bg-error-container hover:bg-error text-on-error-container hover:text-on-error active:scale-95'
                }`}
                title={isSelf ? 'Cannot disable your own account' : 'Disable user'}
              >
                <Power className="h-3.5 w-3.5" />
                <span>Disable</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSelf}
                onClick={() => {
                  if (isSelf) return;
                  handleEnableUser();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                  isSelf
                    ? 'bg-surface-container opacity-45 cursor-not-allowed text-outline'
                    : 'bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary active:scale-95'
                }`}
                title={isSelf ? 'Cannot enable your own account' : 'Enable user'}
              >
                <Power className="h-3.5 w-3.5" />
                <span>Enable</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Confirmation Banner / Warning Dialog */}
        {showConfirmDisable && !isSelf && (
          <div className="p-4 bg-error-container text-on-error-container flex flex-col gap-2.5 animate-in slide-in-from-top duration-200 border-b border-error/20">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h3 className="font-bold text-sm">Confirm Status Change</h3>
                <p>
                  You are about to disable this user.{' '}
                  <strong>{user.userName}</strong> will lose terminal access
                  across all kitchen stations immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmDisable(false)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-semibold text-xs shadow-sm hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisable}
                className="px-3 py-1.5 rounded-lg bg-error text-on-error font-semibold text-xs shadow-sm hover:bg-error/90 transition-colors flex items-center gap-1"
              >
                <Power className="h-3.5 w-3.5" />
                <span>Confirm Disable</span>
              </button>
            </div>
          </div>
        )}

        {/* Edit Mode Interactive Callout Banner */}
        <div className="px-5 py-2.5 bg-surface-container flex items-center justify-between text-xs border-b border-surface-container-high">
          <div className="flex items-center gap-1.5 text-on-surface">
            <Edit2 className="h-4 w-4 text-secondary shrink-0" />
            <span className="truncate">
              {isSelf
                ? 'Self-editing is restricted. You cannot modify your own profile or roles.'
                : 'To edit user details or modify roles, toggle Edit Mode below.'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Edit Mode
            </span>
            <button
              type="button"
              role="switch"
              disabled={isSelf}
              aria-checked={editMode}
              onClick={() => {
                if (isSelf) return;
                setEditMode(!editMode);
              }}
              className={`w-10 h-5 rounded-full relative p-0.5 transition-colors focus:outline-none ${
                isSelf
                  ? 'bg-surface-variant opacity-40 cursor-not-allowed'
                  : editMode
                  ? 'bg-secondary-container'
                  : 'bg-surface-variant'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-surface-container-lowest shadow-md transform transition-transform ${
                  editMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Notice when viewing own profile */}
          {isSelf && (
            <div className="p-3.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded-xl flex items-start gap-2.5 text-xs shadow-sm border border-secondary/30">
              <AlertTriangle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Self-Editing Restricted</p>
                <p className="text-[11px] mt-0.5 text-on-secondary-fixed-variant">
                  You are viewing your own user profile. Modifying your own details, permissions, or active status (enable/disable) is prohibited for security compliance.
                </p>
              </div>
            </div>
          )}

          {/* Email Address (Explicitly Read-Only / Locked) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-on-surface">
                User Email Address
              </label>
              <span className="flex items-center gap-1 text-[11px] text-outline">
                <Lock className="h-3 w-3" />
                Email cannot be modified
              </span>
            </div>
            <div className="relative flex items-center">
              <Mail className="h-4 w-4 absolute left-3 text-outline pointer-events-none" />
              <input
                type="email"
                readOnly
                value={user.userEmail}
                className="w-full h-11 pl-9 pr-9 rounded-xl bg-surface-container-low text-on-surface-variant font-mono text-xs opacity-80 cursor-not-allowed select-all border border-surface-container focus:outline-none"
              />
              <UserCheck className="h-4 w-4 absolute right-3 text-outline pointer-events-none" />
            </div>
          </div>

          {/* User Name */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-on-surface">
                Full Name &amp; Title
              </label>
              <span
                className={`text-[11px] font-bold ${
                  editMode ? 'text-secondary-container' : 'text-outline'
                }`}
              >
                {editMode ? 'Editable' : 'Locked'}
              </span>
            </div>
            <input
              type="text"
              readOnly={!editMode}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full h-11 px-3 rounded-xl font-body text-sm transition-all border ${
                editMode
                  ? 'bg-surface-container-lowest text-on-surface border-outline-variant/60 focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 focus:outline-none'
                  : 'bg-surface-container-low text-on-surface-variant cursor-not-allowed border-surface-container'
              }`}
            />
          </div>

          {/* Assigned Roles Tags */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-on-surface">
                Assigned Operational Roles
              </label>
              <div className="flex items-center gap-2">
                {isLoadingRoles && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-secondary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading roles...</span>
                  </span>
                )}
                <span className="text-on-surface-variant font-bold text-[11px]">
                  {assignedRoleIds.length} Assigned
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 p-2.5 bg-surface-container-low rounded-xl min-h-[46px] items-center border border-surface-container">
              {assignedRoleIds.length === 0 ? (
                <span className="text-xs text-outline italic px-1">
                  No active station roles assigned.
                </span>
              ) : (
                assignedRoleIds.map((roleId) => {
                  const roleName = rolesMap[roleId] || resolveRoleName(roleId, rolesMap);
                  return (
                    <div
                      key={roleId}
                      className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-medium shadow-sm transition-all"
                    >
                      {getRoleIcon(roleName)}
                      <span>{roleName}</span>
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(roleId)}
                          className="ml-1 w-4 h-4 rounded flex items-center justify-center hover:bg-error hover:text-on-error transition-colors text-on-primary/70"
                          title={`Remove ${roleName} (returns to available roles)`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Add Roles Input with Autocomplete (Only if editMode) */}
          {editMode && (
            <div className="space-y-1 relative" ref={dropdownRef}>
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-on-surface">
                  Available Roles to Add ({availableRoleEntries.length})
                </label>
                <span className="text-[10px] text-on-surface-variant">
                  api/v1/admin/get_roles
                </span>
              </div>

              <input
                type="text"
                value={roleSearch}
                onFocus={() => setShowRoleDropdown(true)}
                onChange={(e) => {
                  setRoleSearch(e.target.value);
                  setShowRoleDropdown(true);
                }}
                placeholder="Search to add unassigned role (e.g. Sauté Lead, Expediter)..."
                className="w-full h-11 px-3 rounded-xl bg-surface-container-lowest text-on-surface font-body text-sm border border-outline-variant/50 focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 focus:outline-none transition-all placeholder:text-outline-variant"
              />

              {showRoleDropdown && (
                <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl mt-1 overflow-hidden border border-surface-container z-20 max-h-44 overflow-y-auto divide-y divide-surface-container-low">
                  {filteredRoleSuggestions.length === 0 ? (
                    <div className="p-3 text-xs text-on-surface-variant text-center">
                      {availableRoleEntries.length === 0
                        ? 'All available roles are currently assigned.'
                        : 'No unassigned roles match your search.'}
                    </div>
                  ) : (
                    filteredRoleSuggestions.map(([roleId, roleName]) => (
                      <div
                        key={roleId}
                        className="flex items-center justify-between px-3.5 py-2 hover:bg-surface-container-low transition-colors group cursor-pointer"
                        onClick={() => handleAddRole(roleId)}
                      >
                        <div className="flex items-center gap-2">
                          {getRoleIcon(roleName)}
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-primary">
                              {roleName}
                            </span>
                            <span className="text-[10px] text-outline font-mono">
                              {roleId}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-2 py-0.5 rounded bg-secondary text-on-secondary text-[11px] font-bold flex items-center gap-0.5 shadow-sm"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Operational History Micro-card */}
          <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container text-xs">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-outline" />
              <div>
                <span className="font-bold text-on-surface uppercase text-[10px]">
                  Shift Compliance
                </span>
                <p className="text-on-surface-variant text-[11px]">
                  Last HACCP Temp Check confirmed today
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container text-on-tertiary-container uppercase">
              Logged
            </span>
          </div>

          {/* Unsaved Changes Alert Callout */}
          {hasChanges && (
            <div className="p-3 bg-secondary-fixed text-on-secondary-fixed-variant rounded-xl flex items-center justify-between text-xs shadow-sm border border-secondary/30">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-secondary" />
                <span>Unsaved changes detected</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="font-bold text-[11px] underline hover:opacity-80"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Bottom Interactive Action Bar */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container flex items-center justify-between gap-3">
          <button
            type="button"
            className="h-10 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <History className="h-4 w-4" />
            <span>Audit Log</span>
          </button>

          <div className="flex items-center gap-2">
            {!editMode && !isSelf ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="h-10 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Edit2 className="h-3.5 w-3.5 text-secondary" />
                <span>Edit</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving || isSelf}
              className={`h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
                hasChanges && !isSaving && !isSelf
                  ? 'bg-primary text-on-primary hover:bg-inverse-surface active:scale-95'
                  : 'bg-primary-container text-on-primary opacity-50 cursor-not-allowed'
              }`}
              title={isSelf ? 'Cannot save changes to your own account' : undefined}
            >
              <CheckCircle2
                className={`h-4 w-4 ${
                  savedFeedback ? 'text-tertiary-fixed animate-spin' : 'text-tertiary-fixed'
                }`}
              />
              <span>{savedFeedback ? 'Saved!' : isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};