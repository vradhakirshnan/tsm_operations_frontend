import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Flame,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  CookingPot,
  Truck,
  Users,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const OperationsManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeStation } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-headline text-xs font-bold uppercase tracking-wider">
                Manager Overview
              </span>
              <span className="text-xs text-on-primary/70">{activeStation}</span>
            </div>
            <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {user?.fullName || 'Operations Manager'}
            </h1>
            <p className="font-body text-xs text-on-primary/80 max-w-xl">
              Supervising kitchen prep lines, shift roster capacity, packing
              indents, and station dispatch metrics for active dinner service.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/kitchen')}
              className="px-4 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-headline text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <CookingPot className="h-4 w-4" />
              <span>Live Kitchen Board</span>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-headline text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Users className="h-4 w-4 text-tertiary-fixed" />
              <span>Staff Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Active KOTs on Line',
            value: '18',
            delta: '+4 in last 15m',
            icon: Flame,
            color: 'text-secondary-container',
            bg: 'bg-secondary-fixed/30',
          },
          {
            label: 'Avg Prep Cycle',
            value: '11.4 min',
            delta: '-1.8m vs par target',
            icon: Clock,
            color: 'text-tertiary-fixed-dim',
            bg: 'bg-tertiary-container/30',
          },
          {
            label: 'Roster Staff on Shift',
            value: '8 / 8',
            delta: '100% Station coverage',
            icon: ShieldCheck,
            color: 'text-tertiary-fixed',
            bg: 'bg-surface-container',
          },
          {
            label: 'Dispatch Turnaround',
            value: '4.2 min',
            delta: 'Partner wait on target',
            icon: Truck,
            color: 'text-secondary',
            bg: 'bg-secondary-fixed/40',
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  {kpi.label}
                </span>
                <div className={`p-2 rounded-xl ${kpi.bg}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-headline text-2xl font-bold text-on-surface">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                  <TrendingUp className="h-3 w-3 text-tertiary-fixed-dim" />
                  <span>{kpi.delta}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Station Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-surface-container shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <CookingPot className="h-5 w-5 text-secondary" />
              <h2 className="font-headline text-base font-bold text-on-surface">
                Station Production Matrix
              </h2>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">
              Real-time load
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                station: 'Sauté Station #01',
                lead: 'Elena Rostova',
                activeTickets: 6,
                load: 85,
                status: 'High Load',
                badgeColor: 'bg-secondary-fixed text-on-secondary-fixed-variant',
              },
              {
                station: 'Grill Station #02',
                lead: 'Sarah Jenkins',
                activeTickets: 4,
                load: 60,
                status: 'Optimal',
                badgeColor: 'bg-tertiary-container text-on-tertiary-container',
              },
              {
                station: 'Pass & Expediter Desk',
                lead: 'Marco Rossi',
                activeTickets: 5,
                load: 72,
                status: 'Flowing',
                badgeColor: 'bg-tertiary-container text-on-tertiary-container',
              },
              {
                station: 'Cold Prep & Salad',
                lead: 'Daniel Ruiz',
                activeTickets: 3,
                load: 40,
                status: 'Normal',
                badgeColor: 'bg-surface-container text-on-surface',
              },
            ].map((st) => (
              <div
                key={st.station}
                className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-headline text-sm font-bold text-primary">
                      {st.station}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${st.badgeColor}`}
                    >
                      {st.status}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Lead: <strong className="text-on-surface">{st.lead}</strong> •{' '}
                    {st.activeTickets} Active Tickets
                  </p>
                </div>

                <div className="w-full sm:w-36 flex items-center gap-2 shrink-0">
                  <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-secondary-container h-full rounded-full"
                      style={{ width: `${st.load}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-on-surface">
                    {st.load}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manager Quick Actions Drawer */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-surface-container shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-headline text-sm font-bold text-on-surface flex items-center gap-2">
              <Layers className="h-4 w-4 text-secondary" />
              <span>Operations Quick Links</span>
            </h3>

            <div className="space-y-2">
              {[
                { label: 'Kitchen Display (KDS)', path: '/kitchen', desc: 'Manage KOT lines & preparation boards' },
                { label: 'Dispatch & Driver Handover', path: '/dispatch', desc: 'Rider assignment and handover slips' },
                { label: 'Stock & Indents Oversight', path: '/inventory', desc: 'Material requests & walk-in stock' },
                { label: 'Staff Roster & Permissions', path: '/admin/users', desc: 'Add or modify line station roles' },
                { label: 'Billing Reconciliation', path: '/reconciliation', desc: 'Audit variances and payments' },
              ].map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => navigate(link.path)}
                  className="w-full p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-primary group-hover:text-secondary transition-colors">
                      {link.label}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      {link.desc}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-secondary-fixed/30 rounded-xl border border-secondary-container/30 flex items-center gap-2.5 text-xs text-on-secondary-fixed">
            <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
            <span>Shift HACCP & Temperature Compliance Logged for Dinner Service</span>
          </div>
        </div>
      </div>
    </div>
  );
};
