import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  Flame,
  Boxes,
  Bike,
  Scale,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const navItems: NavItem[] = [
    {
      name: 'Operations Overview',
      path: '/',
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
    },
    {
      name: 'Customer & Coordinates',
      path: '/customers',
      icon: <Users className="h-5 w-5 shrink-0" />,
    },
    {
      name: 'Menu & Recipe Catalog',
      path: '/menu',
      icon: <UtensilsCrossed className="h-5 w-5 shrink-0" />,
    },
    {
      name: 'Order Management',
      path: '/orders',
      icon: <ShoppingBag className="h-5 w-5 shrink-0" />,
      badge: 'Live',
    },
    {
      name: 'Kitchen & KOT Prep',
      path: '/kitchen',
      icon: <Flame className="h-5 w-5 shrink-0" />,
      badge: 'Active',
    },
    {
      name: 'Inventory & Materials',
      path: '/inventory',
      icon: <Boxes className="h-5 w-5 shrink-0" />,
    },
    {
      name: 'Dispatch & Handover',
      path: '/dispatch',
      icon: <Bike className="h-5 w-5 shrink-0" />,
    },
    {
      name: 'Billing Reconciliation',
      path: '/reconciliation',
      icon: <Scale className="h-5 w-5 shrink-0" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/90">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-extrabold text-lg">
            🍽️
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              TSM OpsHub
              <span className="text-[10px] font-semibold text-brand-400 bg-brand-500/10 px-1.5 py-0.2 rounded border border-brand-500/20">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Cloud Kitchen & SCM</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Operations Modules
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-800 text-brand-400 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer System Status Banner */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 m-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Sparkles className="h-4 w-4 text-brand-400" />
            <span>FastAPI Realtime Core</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Connected via SSE streaming pipeline with auto-reconnecting channels.
          </p>
        </div>
      </aside>
    </>
  );
};
