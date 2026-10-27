import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  getUsersApi,
  saveUserApi,
  toggleUserStatusApi,
} from '../../api/usersApi';
import { AdminUser } from './types';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { UserActionSheet } from './UserActionSheet';
import {
  Building2,
  Search,
  ArrowUpDown,
  MoreVertical,
  Plus,
  Clock,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  Shield,
  Layers,
  Flame,
  CookingPot,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Users,
} from 'lucide-react';

export const UserManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeStation, setActiveStation, logout } = useAuthStore();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastUsed' | 'id'>('name');
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [disabledAccordionOpen, setDisabledAccordionOpen] = useState(true);

  // Modal and Action Sheet States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [actionSheetUser, setActionSheetUser] = useState<AdminUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial users via getUsersApi
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsersApi();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateUser = async (userData: Omit<AdminUser, 'userId'>) => {
    const created = await saveUserApi(userData);
    setUsers((prev) => [created, ...prev]);
    showToast(`User ${created.userName} successfully provisioned.`);
  };

  const handleUpdateUser = async (updated: AdminUser) => {
    await saveUserApi(updated);
    setUsers((prev) =>
      prev.map((u) => (u.userId === updated.userId ? updated : u))
    );
    showToast(`User ${updated.userName} successfully updated.`);
  };

  const handleToggleStatus = async (targetUser: AdminUser) => {
    const nextStatus = !targetUser.enabled;
    await toggleUserStatusApi(targetUser.userId, nextStatus);
    setUsers((prev) =>
      prev.map((u) =>
        u.userId === targetUser.userId ? { ...u, enabled: nextStatus } : u
      )
    );
    showToast(
      `User ${targetUser.userName} is now ${nextStatus ? 'Active' : 'Disabled'}.`
    );
  };

  const handleResetPin = (targetUser: AdminUser) => {
    showToast(`New station PIN bypass generated for ${targetUser.userName}.`);
  };

  // Filter and sort active and disabled users
  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        u.userName.toLowerCase().includes(q) ||
        u.userEmail.toLowerCase().includes(q) ||
        u.roles.some((r) => r.toLowerCase().includes(q))
      );
    });

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.userName.localeCompare(b.userName);
      }
      if (sortBy === 'lastUsed') {
        return (b.lastUsed || '').localeCompare(a.lastUsed || '');
      }
      return a.userId.localeCompare(b.userId);
    });

    return result;
  }, [users, searchTerm, sortBy]);

  const activeCrew = useMemo(
    () => filteredUsers.filter((u) => u.enabled),
    [filteredUsers]
  );
  const disabledCrew = useMemo(
    () => filteredUsers.filter((u) => !u.enabled),
    [filteredUsers]
  );

  const getRoleIcon = (roleName: string) => {
    const lower = roleName.toLowerCase();
    if (lower.includes('lead') || lower.includes('chef')) {
      return <Flame className="h-3 w-3 text-secondary" />;
    }
    if (lower.includes('manager') || lower.includes('management')) {
      return <Shield className="h-3 w-3 text-tertiary-fixed" />;
    }
    if (lower.includes('inventory')) {
      return <Layers className="h-3 w-3 text-tertiary-fixed-dim" />;
    }
    return <CookingPot className="h-3 w-3 text-surface-tint" />;
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top border border-secondary-container/30">
          <UserCheck className="h-4 w-4 text-tertiary-fixed" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header - Sticky / Desktop & Mobile Friendly */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-surface-container shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Left: Brand & Station Pod */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white text-lg font-black shadow-md shrink-0">
                🍽️
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline text-base sm:text-lg font-bold text-on-surface truncate tracking-tight">
                    KitchenOps Admin
                  </h1>
                  <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary-container/20 text-secondary font-headline text-[10px] font-bold uppercase tracking-wider border border-secondary-container/30">
                    Console
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <Building2 className="h-3.5 w-3.5 text-secondary" />
                  <select
                    value={activeStation}
                    onChange={(e) => setActiveStation(e.target.value)}
                    className="bg-transparent text-[11px] font-bold text-on-secondary-fixed-variant uppercase tracking-wider focus:outline-none cursor-pointer"
                  >
                    <option value="Central Kitchen #04">Central Kitchen #04</option>
                    <option value="Koramangala Pod 1">Koramangala Pod 1</option>
                    <option value="Indiranagar Pod 2">Indiranagar Pod 2</option>
                    <option value="HSR Layout Satellite Pod">HSR Layout Satellite Pod</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Actions, OpsHub Switcher & Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Primary Add User Button (Visible on desktop/tablet) */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold shadow-md hover:bg-inverse-surface active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4 text-tertiary-fixed" />
                <span>Add User</span>
              </button>

              {/* Quick switch to main Operations Hub */}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-surface-container-high transition-colors"
                title="Switch to Cloud Kitchen Operations Hub"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-secondary" />
                <span>Operations Hub</span>
              </button>

              {/* Admin Avatar & Role */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-surface-container">
                <div className="relative">
                  <img
                    src={
                      user?.avatarUrl ||
                      'https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=1e293b&textColor=ffffff'
                    }
                    alt={user?.fullName || 'Admin'}
                    className="w-9 h-9 rounded-xl object-cover border border-outline-variant/40 shadow-sm"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-tertiary-fixed-dim rounded-full ring-2 ring-surface" />
                </div>

                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-on-surface truncate max-w-[120px]">
                    {user?.fullName || 'Kitchen Admin'}
                  </span>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                    {user?.role || 'Admin'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login', { replace: true });
                  }}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Subheader Navigation Pills */}
          <div className="pb-3 pt-1 flex items-center justify-between gap-3">
            <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl gap-1 w-full sm:w-80">
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`flex items-center justify-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'users'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm font-headline'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                User Management
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('roles')}
                className={`flex items-center justify-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'roles'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm font-headline'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Role Management
              </button>
            </div>

            {/* Mobile quick link to ops */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="md:hidden text-xs font-bold text-secondary flex items-center gap-1 shrink-0"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Ops Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-28 md:pb-12">
        {activeTab === 'roles' ? (
          /* Role Management View Stub */
          <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-surface-container shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              <h2 className="font-headline text-lg font-bold text-primary">
                Kitchen Station Role Matrix
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant max-w-xl">
              Configured roles define line-fire access, inventory write-offs,
              dispatch handover authority, and HACCP compliance auditing across
              stations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {[
                { title: 'Operations Manager', desc: 'Full station dispatch & shift auditing', count: 1 },
                { title: 'Station Lead', desc: 'Sauté, Grill, and Prep line management', count: 3 },
                { title: 'Operations Executive', desc: 'Order fulfillment and ticket preparation', count: 4 },
                { title: 'Inventory Admin', desc: 'Cold storage, dry stock & par levels', count: 1 },
                { title: 'Safety & HACCP Officer', desc: 'Temperature inspection & compliance', count: 1 },
                { title: 'Kitchen Management', desc: 'Multi-pod operational oversight', count: 2 },
              ].map((r) => (
                <div
                  key={r.title}
                  className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between"
                >
                  <div>
                    <span className="font-headline text-sm font-bold text-primary">
                      {r.title}
                    </span>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {r.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-surface-container flex items-center justify-between text-xs">
                    <span className="text-[11px] text-outline">Assigned Crew:</span>
                    <span className="font-bold text-secondary font-mono">
                      {r.count} users
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* User Management View (Stitch Design Matching) */
          <div className="space-y-6">
            {/* Operational Pulse & Live Metrics */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface text-xs font-bold font-headline">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim animate-pulse" />
                  Active ({activeCrew.length})
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold font-headline">
                  <span className="w-2 h-2 rounded-full bg-outline-variant" />
                  Inactive ({disabledCrew.length})
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-tertiary-fixed" />
                <span className="text-[11px] uppercase tracking-wider">Sync Live</span>
                <button
                  type="button"
                  onClick={fetchUsers}
                  disabled={isLoading}
                  className="p-1 hover:text-on-surface transition-colors"
                  title="Refresh users"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users by name, email, or station role..."
                  className="w-full h-11 pl-10 pr-4 bg-surface-container-lowest text-on-surface text-sm rounded-xl shadow-sm border border-outline-variant/40 focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all placeholder:text-outline"
                />
              </div>

              {/* Sort Selector Bar */}
              <div className="flex items-center justify-between sm:justify-start gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold">
                  <ArrowUpDown className="h-3.5 w-3.5 text-secondary" />
                  <span>Sort by:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-surface-container-lowest text-on-surface text-xs font-bold py-1.5 pl-2.5 pr-6 rounded-lg shadow-sm border border-outline-variant/40 focus:outline-none cursor-pointer"
                >
                  <option value="name">Last Name (A → Z)</option>
                  <option value="lastUsed">Last Used (Recent)</option>
                  <option value="id">User ID (First → Latest)</option>
                </select>
              </div>
            </div>

            {/* Section 1: Active Crew */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline text-base font-bold text-on-surface">
                    Active Crew
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-bold">
                    {activeCrew.length} on shift
                  </span>
                </div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  {activeStation}
                </span>
              </div>

              {/* Active Users Grid / Stack */}
              {activeCrew.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-surface-container space-y-2">
                  <Users className="h-8 w-8 text-outline mx-auto" />
                  <p className="text-xs text-on-surface-variant font-medium">
                    No active crew members found matching your search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {activeCrew.map((staff, idx) => (
                    <article
                      key={staff.userId}
                      className="p-4 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container hover:border-secondary-container/50 transition-all flex flex-col justify-between gap-3 group"
                    >
                      {/* Top Row: # Index, Avatar, Name & Options */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container text-on-surface-variant font-mono text-xs font-bold shrink-0">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>

                          <img
                            src={staff.avatarUrl}
                            alt={staff.userName}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-outline-variant/30 shadow-sm"
                          />

                          <div className="flex flex-col min-w-0">
                            <h3 className="font-headline text-sm font-bold text-on-surface truncate group-hover:text-secondary transition-colors">
                              {staff.userName}
                            </h3>
                            <span className="text-xs text-on-surface-variant truncate">
                              {staff.userEmail}
                            </span>
                          </div>
                        </div>

                        {/* More Options Button */}
                        <button
                          type="button"
                          onClick={() => setActionSheetUser(staff)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
                          title="Options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Middle: Role Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pl-10">
                        {staff.roles.map((r) => (
                          <span
                            key={r}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface text-[11px] font-semibold"
                          >
                            {getRoleIcon(r)}
                            <span>{r}</span>
                          </span>
                        ))}
                      </div>

                      {/* Bottom Row: Timestamp & Station */}
                      <div className="flex items-center justify-between pt-2 border-t border-surface-container-low text-xs text-on-surface-variant pl-10">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Clock className="h-3 w-3 text-tertiary-fixed-dim" />
                          <span>
                            Last used: <strong className="text-on-surface font-semibold">Today, 10:42 AM</strong>
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim" />
                          <span>{staff.station || 'Exp Station'}</span>
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Section 2: Disabled Users Accordion */}
            <section className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setDisabledAccordionOpen(!disabledAccordionOpen)}
                className="w-full flex items-center justify-between p-3.5 bg-surface-container-low hover:bg-surface-container rounded-2xl transition-colors border border-surface-container"
              >
                <div className="flex items-center gap-2.5">
                  <UserX className="h-4 w-4 text-outline" />
                  <span className="font-headline text-sm font-bold text-on-surface">
                    Disabled Users
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold">
                    {disabledCrew.length} accounts
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-on-surface-variant font-semibold">
                  <span>{disabledAccordionOpen ? 'Collapse' : 'Expand'}</span>
                  {disabledAccordionOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>

              {/* Disabled Users Grid */}
              {disabledAccordionOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 animate-in fade-in duration-200">
                  {disabledCrew.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-xs text-outline italic">
                      No disabled accounts present.
                    </div>
                  ) : (
                    disabledCrew.map((staff, idx) => (
                      <article
                        key={staff.userId}
                        className="p-4 bg-surface-container-lowest/80 rounded-2xl shadow-sm border border-surface-container opacity-80 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container text-outline font-mono text-xs font-bold shrink-0">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>

                            <img
                              src={staff.avatarUrl}
                              alt={staff.userName}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 grayscale opacity-60 border border-outline-variant/30"
                            />

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-headline text-sm font-bold text-on-surface-variant truncate">
                                  {staff.userName}
                                </h3>
                                <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-outline text-[9px] uppercase font-bold tracking-tight">
                                  Revoked
                                </span>
                              </div>
                              <span className="text-xs text-outline truncate">
                                {staff.userEmail}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActionSheetUser(staff)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pl-10">
                          {staff.roles.map((r) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 rounded bg-surface-container text-outline text-[11px]"
                            >
                              {r}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-surface-container-low text-xs text-outline pl-10">
                          <span className="text-[11px]">Last used: Sep 14, 2023</span>
                          <span className="text-[10px] text-error font-semibold">
                            Inactive &gt; 1 yr
                          </span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) on Mobile */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container shadow-xl flex items-center justify-center transition-transform active:scale-95 border-2 border-surface"
          title="Add User"
        >
          <Plus className="h-6 w-6 font-bold" />
        </button>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-surface-container shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors ${
              activeTab === 'users' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px]">Staff &amp; Roles</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/kitchen')}
            className="flex flex-col items-center justify-center gap-0.5 w-16 h-12 text-on-surface-variant transition-colors"
          >
            <CookingPot className="h-5 w-5" />
            <span className="text-[10px]">Stations</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center gap-0.5 w-16 h-12 text-on-surface-variant transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px]">Ops Hub</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="flex flex-col items-center justify-center gap-0.5 w-16 h-12 text-on-surface-variant hover:text-error transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px]">Logout</span>
          </button>
        </div>
      </nav>

      {/* Modals & Action Sheet */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveUser={handleCreateUser}
      />

      <EditUserModal
        isOpen={!!editUser}
        user={editUser}
        onClose={() => setEditUser(null)}
        onUpdateUser={handleUpdateUser}
        onToggleStatus={async (userId) => {
          const target = users.find((u) => u.userId === userId);
          if (target) await handleToggleStatus(target);
        }}
      />

      <UserActionSheet
        isOpen={!!actionSheetUser}
        user={actionSheetUser}
        onClose={() => setActionSheetUser(null)}
        onEdit={(u) => setEditUser(u)}
        onToggleStatus={handleToggleStatus}
        onResetPin={handleResetPin}
      />
    </div>
  );
};
