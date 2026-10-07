import React from 'react';
import { SSEConnectionState } from '../../types';
import { Radio, RefreshCw, AlertCircle, WifiOff } from 'lucide-react';

interface SSEStatusIndicatorProps {
  connectionState: SSEConnectionState;
  reconnectAttempts: number;
  onReconnect: () => void;
  channel?: string;
}

export const SSEStatusIndicator: React.FC<SSEStatusIndicatorProps> = ({
  connectionState,
  reconnectAttempts,
  onReconnect,
  channel = 'kitchen:all',
}) => {
  const getStatusConfig = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return {
          color: 'bg-emerald-500 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400 animate-pulse',
          label: 'Live Stream Active',
          icon: <Radio className="h-3.5 w-3.5 text-emerald-400" />,
        };
      case 'CONNECTING':
        return {
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400 animate-ping',
          label: `Connecting... (${reconnectAttempts > 0 ? `Retry ${reconnectAttempts}` : 'init'})`,
          icon: <RefreshCw className="h-3.5 w-3.5 text-amber-400 animate-spin" />,
        };
      case 'ERROR':
        return {
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500',
          label: 'Stream Offline (Auto-reconnecting)',
          icon: <AlertCircle className="h-3.5 w-3.5 text-rose-400" />,
        };
      case 'DISCONNECTED':
      default:
        return {
          color: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-500',
          label: 'Disconnected',
          icon: <WifiOff className="h-3.5 w-3.5 text-slate-400" />,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium ${config.color}`}
        title={`SSE Channel: ${channel}`}
      >
        <span className={`h-2 w-2 rounded-full ${config.dot}`} />
        <span>{config.label}</span>
      </div>

      {connectionState !== 'CONNECTED' && (
        <button
          onClick={onReconnect}
          className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Force reconnect SSE stream"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
