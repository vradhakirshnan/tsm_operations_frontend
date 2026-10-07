import { DispatchAssignment, HandoverLogEntry, DeliveryPartner, DispatchStatus } from '../types';
import { mockDispatchAssignments, mockHandoverLogs } from './mockData';

let dispatchStore: DispatchAssignment[] = [...mockDispatchAssignments];
let handoverLogsStore: HandoverLogEntry[] = [...mockHandoverLogs];

export const dispatchApi = {
  async getDispatchQueue(): Promise<DispatchAssignment[]> {
    return [...dispatchStore];
  },

  async assignPartner(
    dispatchId: string,
    partner: DeliveryPartner,
    riderInfo?: { rider_name: string; rider_phone: string; rider_vehicle_no?: string }
  ): Promise<DispatchAssignment> {
    const item = dispatchStore.find((d) => d.dispatch_id === dispatchId);
    if (!item) throw new Error('Dispatch record not found');

    item.partner = partner;
    if (riderInfo) {
      item.rider_name = riderInfo.rider_name;
      item.rider_phone = riderInfo.rider_phone;
      item.rider_vehicle_no = riderInfo.rider_vehicle_no;
      item.status = 'rider_assigned';
    }
    return { ...item };
  },

  async updateDispatchStatus(dispatchId: string, status: DispatchStatus): Promise<DispatchAssignment> {
    const item = dispatchStore.find((d) => d.dispatch_id === dispatchId);
    if (!item) throw new Error('Dispatch record not found');
    item.status = status;
    return { ...item };
  },

  async performHandover(
    dispatchId: string,
    verification: {
      otp: string;
      sealChecked: boolean;
      dispatcherName: string;
      notes?: string;
    }
  ): Promise<HandoverLogEntry> {
    const item = dispatchStore.find((d) => d.dispatch_id === dispatchId);
    if (!item) throw new Error('Dispatch record not found');

    item.status = 'handed_over';
    item.handover_at = new Date().toISOString();

    const logEntry: HandoverLogEntry = {
      log_id: `HLOG-${Date.now().toString().slice(-4)}`,
      dispatch_id: item.dispatch_id,
      order_id: item.order_id,
      partner: item.partner,
      rider_name: item.rider_name || 'Assigned Courier',
      rider_phone: item.rider_phone || 'N/A',
      handover_time: new Date().toISOString(),
      dispatcher_name: verification.dispatcherName,
      verified_via_otp: true,
      tamper_seal_checked: verification.sealChecked,
      notes: verification.notes,
    };

    handoverLogsStore.unshift(logEntry);
    return logEntry;
  },

  async getHandoverLogs(): Promise<HandoverLogEntry[]> {
    return [...handoverLogsStore];
  },
};
