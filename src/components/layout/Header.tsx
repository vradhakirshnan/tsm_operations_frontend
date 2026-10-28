import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useKitchenStore } from '../../store/kitchenStore';
import { logoutApi } from '../../api/usersApi';
import { SSEStatusIndicator } from './SSEStatusIndicator';
import { SSEConnectionState } from '../../types';
import {
  Bell,
  Building2,
  ChefHat,
  Menu as MenuIcon,
  CheckCheck,
  AlertTriangle,
  Clock,
  LogOut,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  connectionState: SSEConnectionState;
  reconnectAttempts: number;
  onReconnect: () => void;
  onToggleSidebar: () => void;
}

const STATIONS = [
  'Central Kitchen - Main Pod',
  'Koramangala Cloud Kitchen 1',
  'Indiranagar Cloud Kitchen 2',
  'HSR Layout Satellite Pod',
];

export const Header: React.FC<HeaderProps> = ({
  connectionState,
  reconnectAttempts,
  onReconnect,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const { user, activeStation, setActiveStation, logout } = useAuthStore();
  const { liveAlerts, unreadAlertCount, markAllAlertsAsRead } = useKitchenStore();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Station Switcher */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
          title="Toggle Navigation"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 rounded-lg border border-slate-750">
            <Building2 className="h-4 w-4 text-brand-400" />
            <select
              value={activeStation}
              onChange={(e) => setActiveStation(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {STATIONS.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-slate-200">
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right: Live SSE Stream status, Alerts Bell, Executive Avatar */}
      <div className="flex items-center gap-3">
        {user?.role === 'Admin' && (
          <button
            onClick={() => navigate('/admin/users')}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 text-xs font-bold transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Console</span>
          </button>
        )}

        {/* SSE Stream Status Badge */}
        <SSEStatusIndicator
          connectionState={connectionState}
          reconnectAttempts={reconnectAttempts}
          onReconnect={onReconnect}
        />

        {/* Live Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Operational Alerts"
          >
            <Bell className="h-5 w-5" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Modal */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-750 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold text-slate-100">Live Kitchen Alerts</span>
                </div>
                <button
                  onClick={markAllAlertsAsRead}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark read
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {liveAlerts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No active kitchen alerts</p>
                ) : (
                  liveAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-2.5 rounded-lg border text-xs transition-colors ${
                        alert.read
                          ? 'bg-slate-850/50 border-slate-800 text-slate-400'
                          : 'bg-brand-500/10 border-brand-500/30 text-slate-200'
                      }`}
                    >
                      <p className="font-medium">{alert.message}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        {alert.orderId && (
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-brand-400 font-mono">
                            {alert.orderId}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info / Profile & Sign Out */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-8 w-8 rounded-full border border-brand-500/40 object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <ChefHat className="h-4 w-4" />
            </div>
          )}
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-200">
              {user?.fullName || 'Operations User'}
            </div>
            <div className="text-[11px] text-slate-400">{user?.role || 'Executive'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
