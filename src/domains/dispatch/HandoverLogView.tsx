import React from 'react';
import { HandoverLogEntry } from '../../types';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HandoverLogViewProps {
  logs: HandoverLogEntry[];
}

export const HandoverLogView: React.FC<HandoverLogViewProps> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Delivery Handover Audit & Verification Log
          </h4>
          <p className="text-xs text-slate-400">
            Immutable chain-of-custody log verifying rider OTP verification, tamper seal integrity, and handover timestamps.
          </p>
        </div>

        <Badge variant="success" size="md">
          {logs.length} Completed Handovers
        </Badge>
      </div>

      <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-3.5 pl-4">Log ID</th>
                <th className="py-3.5">Order ID</th>
                <th className="py-3.5">Partner</th>
                <th className="py-3.5">Rider Contact</th>
                <th className="py-3.5">Handover Time</th>
                <th className="py-3.5">Tamper Seal & OTP</th>
                <th className="py-3.5 pr-4 text-right">Dispatcher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-4 font-mono font-bold text-brand-400">
                    {log.log_id}
                  </td>
                  <td className="py-3 font-mono font-semibold text-white">
                    {log.order_id}
                  </td>
                  <td className="py-3 uppercase font-bold text-slate-300">
                    {log.partner.replace('_', ' ')}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-100">{log.rider_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{log.rider_phone}</div>
                  </td>
                  <td className="py-3 text-slate-300 font-mono">
                    {new Date(log.handover_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {log.verified_via_otp && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3 w-3" /> OTP Verified
                        </span>
                      )}
                      {log.tamper_seal_checked && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                          <ShieldCheck className="h-3 w-3" /> Seal Intact
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-300">
                    {log.dispatcher_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
