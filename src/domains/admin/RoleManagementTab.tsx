import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Shield,
  CookingPot,
  Flame,
  Layers,
  Flag,
  Users,
  UserX,
  Loader2,
  CheckCircle2,
  ChefHat,
  SearchX,
} from 'lucide-react';
import {
  getAdminRolesApi,
  createRoleApi,
  disableRoleApi,
  enableRoleApi,
} from '../../api/usersApi';
import { AddRoleModal } from './AddRoleModal';
import { DisableRoleWarningModal } from './DisableRoleWarningModal';
import { StatusPopup } from '../../components/common/StatusPopup';

interface RoleManagementTabProps {
  onRoleCountChange?: (count: number) => void;
}

export const RoleManagementTab: React.FC<RoleManagementTabProps> = ({
  onRoleCountChange,
}) => {
  const [enabledRoles, setEnabledRoles] = useState<Record<string, string>>({});
  const [disabledRoles, setDisabledRoles] = useState<Record<string, string>>({});
  const [roleUserCounts, setRoleUserCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Popups
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [disableTarget, setDisableTarget] = useState<{
    id: string;
    name: string;
    userCount: number;
  } | null>(null);

  const [statusPopup, setStatusPopup] = useState<{
    isOpen: boolean;
    type: 'success' | 'failure';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Fetch roles via api/v1/admin/get_roles with role_type: "all" and user_count: true
  const loadRoles = async (showLoadingSpinner: boolean = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    try {
      const res = await getAdminRolesApi('all', true);
      const enabled = res?.enabled || {};
      const disabled = res?.disabled || {};
      const counts = res?.user_count || {};

      setEnabledRoles(enabled);
      setDisabledRoles(disabled);
      setRoleUserCounts(counts);

      if (onRoleCountChange) {
        onRoleCountChange(Object.keys(enabled).length);
      }
    } catch (err) {
      console.warn('Failed to load roles matrix:', err);
    } finally {
      if (showLoadingSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles(true);
  }, []);

  // Filter and sort active roles alphabetically
  const activeRolesList = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const entries = Object.entries(enabledRoles);

    const filtered = q
      ? entries.filter(
          ([id, name]) =>
            name.toLowerCase().includes(q) || id.toLowerCase().includes(q)
        )
      : entries;

    // Sort alphabetically by role name
    filtered.sort((a, b) => a[1].localeCompare(b[1]));

    return filtered.map(([id, name]) => ({
      id,
      name,
      userCount: roleUserCounts[id] ?? 0,
    }));
  }, [enabledRoles, roleUserCounts, searchTerm]);

  // Filter and sort inactive roles alphabetically (active users count is always 0)
  const inactiveRolesList = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const entries = Object.entries(disabledRoles);

    const filtered = q
      ? entries.filter(
          ([id, name]) =>
            name.toLowerCase().includes(q) || id.toLowerCase().includes(q)
        )
      : entries;

    // Sort alphabetically by role name
    filtered.sort((a, b) => a[1].localeCompare(b[1]));

    return filtered.map(([id, name]) => ({
      id,
      name,
      userCount: 0, // Inactive roles always have 0 active users
    }));
  }, [disabledRoles, searchTerm]);

  // Create new role flow
  const handleSaveRole = async (roleName: string) => {
    try {
      const res = await createRoleApi(roleName);
      if (res.status) {
        setStatusPopup({
          isOpen: true,
          type: 'success',
          title: 'Role Created Successfully',
          message: res.message || `Role "${roleName}" is now active in the central registry.`,
        });
        await loadRoles(false);
      } else {
        setStatusPopup({
          isOpen: true,
          type: 'failure',
          title: 'Failed to Create Role',
          message: res.message || 'The server rejected role creation.',
        });
        // Do not reload dashboard on error
      }
    } catch (err: any) {
      setStatusPopup({
        isOpen: true,
        type: 'failure',
        title: 'Error Creating Role',
        message: err.message || 'An unexpected network error occurred.',
      });
      // Do not reload dashboard on error
    }
  };

  // Initiate role disable (checks active user count)
  const handleInitiateDisable = (role: { id: string; name: string; userCount: number }) => {
    setDisableTarget(role);
  };

  // Confirm role disable flow
  const handleConfirmDisable = async (roleId: string) => {
    setActionInProgressId(roleId);
    try {
      const res = await disableRoleApi(roleId);
      if (res.status) {
        setStatusPopup({
          isOpen: true,
          type: 'success',
          title: 'Role Disabled',
          message: res.message || 'Role has been moved to inactive status.',
        });
        await loadRoles(false);
      } else {
        setStatusPopup({
          isOpen: true,
          type: 'failure',
          title: 'Failed to Disable Role',
          message: res.message || 'The server rejected disabling this role.',
        });
        // Do not reload dashboard on error
      }
    } catch (err: any) {
      setStatusPopup({
        isOpen: true,
        type: 'failure',
        title: 'Error Disabling Role',
        message: err.message || 'An unexpected network error occurred.',
      });
      // Do not reload dashboard on error
    } finally {
      setActionInProgressId(null);
    }
  };

  // Enable role flow
  const handleEnableRole = async (roleId: string, roleName: string) => {
    setActionInProgressId(roleId);
    try {
      const res = await enableRoleApi(roleId);
      if (res.status) {
        setStatusPopup({
          isOpen: true,
          type: 'success',
          title: 'Role Activated',
          message: res.message || `Role "${roleName}" has been restored to active status.`,
        });
        await loadRoles(false);
      } else {
        setStatusPopup({
          isOpen: true,
          type: 'failure',
          title: 'Failed to Enable Role',
          message: res.message || 'The server could not enable this role.',
        });
        // Revert to dashboard without refreshing on error
      }
    } catch (err: any) {
      setStatusPopup({
        isOpen: true,
        type: 'failure',
        title: 'Error Enabling Role',
        message: err.message || 'An unexpected network error occurred.',
      });
      // Revert to dashboard without refreshing on error
    } finally {
      setActionInProgressId(null);
    }
  };

  const getRoleIcon = (roleName: string) => {
    const lower = roleName.toLowerCase();
    if (lower.includes('lead') || lower.includes('master')) {
      return <Flame className="h-4 w-4 text-secondary-container" />;
    }
    if (lower.includes('manager') || lower.includes('management') || lower.includes('admin')) {
      return <Shield className="h-4 w-4 text-tertiary-fixed" />;
    }
    if (lower.includes('inventory') || lower.includes('stock')) {
      return <Layers className="h-4 w-4 text-tertiary-fixed-dim" />;
    }
    if (lower.includes('chef') || lower.includes('cook')) {
      return <ChefHat className="h-4 w-4 text-secondary" />;
    }
    if (lower.includes('expediter')) {
      return <Flag className="h-4 w-4 text-surface-tint" />;
    }
    return <CookingPot className="h-4 w-4 text-surface-tint" />;
  };

  const totalActive = Object.keys(enabledRoles).length;
  const totalInactive = Object.keys(disabledRoles).length;
  const isSearchActive = searchTerm.trim().length > 0;
  const totalVisible = activeRolesList.length + inactiveRolesList.length;

  return (
    <div className="flex flex-col w-full gap-4 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Stats Strip matching Stitch Screen */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-tertiary-fixed text-on-tertiary-fixed shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Active Roles
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
                {totalActive}
              </span>
              <span className="text-xs text-on-tertiary-container font-semibold">
                Ready
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-surface-container-high text-on-surface-variant shrink-0">
            <UserX className="h-6 w-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Inactive Roles
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
                {totalInactive}
              </span>
              <span className="text-xs text-outline font-semibold">
                Archived
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - No Filters or Dropdowns */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search roles by name..."
          className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest rounded-xl font-body text-sm text-on-surface placeholder:text-outline shadow-sm border border-outline-variant/40 focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface"
          >
            <span className="text-xs font-bold font-mono">ESC</span>
          </button>
        )}
      </div>

      {/* Loading State Indicator */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 bg-surface-container-lowest rounded-2xl border border-surface-container">
          <Loader2 className="h-8 w-8 text-secondary animate-spin" />
          <p className="text-xs text-on-surface-variant font-medium">
            Fetching active and inactive roles with user counts (api/v1/admin/get_roles)...
          </p>
        </div>
      ) : isSearchActive && totalVisible === 0 ? (
        /* Empty Search Result State */
        <div className="flex flex-col items-center justify-center p-10 bg-surface-container-lowest rounded-2xl text-center shadow-sm border border-surface-container space-y-2">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-1">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="font-headline text-base font-bold text-on-surface">
            No Roles Found
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm">
            No active or inactive roles matched <strong className="text-primary">"{searchTerm}"</strong>. Try a different query or add a new operational role below.
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="mt-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <>
          {/* SECTION 1: Active Roles Table / List */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim animate-pulse" />
                <h2 className="font-headline text-base font-bold text-on-surface">
                  Active Roles
                </h2>
                <span className="text-xs text-on-surface-variant font-medium">
                  ({activeRolesList.length})
                </span>
              </div>
              <span className="font-headline text-[11px] font-bold px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant uppercase tracking-wider">
                Operational
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {activeRolesList.length === 0 ? (
                <div className="p-4 bg-surface-container-lowest rounded-xl text-center text-xs text-outline italic border border-surface-container">
                  {isSearchActive ? 'No active roles match your search.' : 'No active roles found.'}
                </div>
              ) : (
                activeRolesList.map((role) => {
                  const isBusy = actionInProgressId === role.id;
                  return (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-3.5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container hover:border-secondary-container/40 transition-all group"
                    >
                      {/* Component 1: Role Name & Icon */}
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-xs">
                          {getRoleIcon(role.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-headline text-sm font-bold text-on-surface truncate group-hover:text-secondary transition-colors">
                            {role.name}
                          </span>
                          {/* Component 2: Number of active users */}
                          <span className="font-body text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                            <Users className="h-3.5 w-3.5 text-secondary shrink-0" />
                            <span>
                              <strong className="text-on-surface font-semibold">
                                {role.userCount}
                              </strong>{' '}
                              active {role.userCount === 1 ? 'user' : 'users'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Component 3: Disable Button */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleInitiateDisable(role)}
                        aria-label={`Disable ${role.name} Role`}
                        className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-headline text-xs font-bold transition-all active:scale-95 shrink-0 min-h-[34px] shadow-xs disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span>Disable</span>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* SECTION 2: Inactive Roles Table / List */}
          <section className="flex flex-col gap-2 mt-3">
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-outline" />
                <h2 className="font-headline text-base font-bold text-on-surface-variant">
                  Inactive Roles
                </h2>
                <span className="text-xs text-outline font-medium">
                  ({inactiveRolesList.length})
                </span>
              </div>
              <span className="font-headline text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant uppercase tracking-wider">
                0 Assignments
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {inactiveRolesList.length === 0 ? (
                <div className="p-4 bg-surface-container-lowest/80 rounded-xl text-center text-xs text-outline italic border border-surface-container">
                  {isSearchActive ? 'No inactive roles match your search.' : 'No inactive roles present.'}
                </div>
              ) : (
                inactiveRolesList.map((role) => {
                  const isBusy = actionInProgressId === role.id;
                  return (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-3.5 bg-surface-container-lowest/85 rounded-xl shadow-xs border border-surface-container opacity-90 transition-all hover:opacity-100"
                    >
                      {/* Component 1: Role Name & Icon (muted styling) */}
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-outline shrink-0">
                          <UserX className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-headline text-sm font-bold text-outline truncate">
                            {role.name}
                          </span>
                          {/* Component 2: Number of active users (always zero) */}
                          <span className="font-body text-xs text-outline flex items-center gap-1.5 mt-0.5 font-mono">
                            <Users className="h-3.5 w-3.5 shrink-0 opacity-60" />
                            <span>0 active users</span>
                          </span>
                        </div>
                      </div>

                      {/* Component 3: Enable Button */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleEnableRole(role.id, role.name)}
                        aria-label={`Enable ${role.name} Role`}
                        className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant hover:bg-tertiary-fixed-dim font-headline text-xs font-bold transition-all active:scale-95 shrink-0 min-h-[34px] shadow-xs disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span>Enable</span>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Bottom Add Row / Add Role Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-on-surface-variant text-center sm:text-left">
              Configured roles sync with station KOT lines, inventory indents, and audit logs.
            </span>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold shadow-md hover:bg-inverse-surface active:scale-95 transition-all shrink-0"
            >
              <Plus className="h-4 w-4 text-tertiary-fixed" />
              <span>Add Role</span>
            </button>
          </div>
        </>
      )}

      {/* Floating Action Button (FAB) on Mobile for Add Role */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container shadow-xl flex items-center justify-center transition-transform active:scale-95 border-2 border-surface cursor-pointer"
          title="Add Role"
        >
          <Plus className="h-6 w-6 font-bold" />
        </button>
      </div>

      {/* Add Role Modal */}
      <AddRoleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveRole={handleSaveRole}
      />

      {/* Disable Role Warning Modal */}
      <DisableRoleWarningModal
        isOpen={!!disableTarget}
        roleId={disableTarget?.id || null}
        roleName={disableTarget?.name || ''}
        userCount={disableTarget?.userCount || 0}
        onClose={() => setDisableTarget(null)}
        onConfirmDisable={handleConfirmDisable}
      />

      {/* Status Result Popup */}
      <StatusPopup
        isOpen={statusPopup.isOpen}
        type={statusPopup.type}
        title={statusPopup.title}
        message={statusPopup.message}
        onClose={() => setStatusPopup((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
