import React from 'react';
import { Order, OrderStatus } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  User,
  MapPin,
  ExternalLink,
  ChefHat,
  CheckCircle,
  Truck,
  Ban,
} from 'lucide-react';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details: ${order.order_id}`}
      subtitle={`Placed ${new Date(order.order_timestamp).toLocaleTimeString()}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Status & Channel Header */}
        <div className="flex items-center justify-between p-4 bg-slate-850 rounded-xl border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
              Current Kitchen Lifecycle
            </span>
            <div className="mt-1">
              <Badge
                variant={
                  order.status === 'ready'
                    ? 'success'
                    : order.status === 'cooking'
                    ? 'warning'
                    : order.status === 'dispatched'
                    ? 'neutral'
                    : 'brand'
                }
                size="md"
                dot
              >
                {order.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
              Source & Total
            </span>
            <span className="text-sm font-bold text-white font-mono uppercase">
              {order.source_channel || 'direct'} • ₹{order.total_amount}
            </span>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <User className="h-4 w-4 text-brand-400" />
              <span>Customer Information</span>
            </div>
            <p className="text-slate-100 font-medium">{order.customer?.name || 'Walk-in'}</p>
            <p className="text-slate-400 font-mono">{order.customer?.phone}</p>
            {order.customer?.notes && (
              <p className="text-amber-400/90 text-[11px] mt-1">{order.customer?.notes}</p>
            )}
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <MapPin className="h-4 w-4 text-brand-400" />
              <span>Delivery Coordinates</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{order.address?.address_line}</p>
            {order.address?.latitude && order.address?.longitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${order.address.latitude},${order.address.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:underline pt-1"
              >
                <span>GPS: {order.address.latitude}, {order.address.longitude}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Order Line Items Breakdown */}
        <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-3.5 bg-slate-900/60 border-b border-slate-800 font-semibold text-xs text-slate-200">
            Dish Items Ordered ({order.items.length})
          </div>

          <div className="divide-y divide-slate-800/60 p-2">
            {order.items.map((item) => (
              <div key={item.item_log_id} className="p-2.5 flex items-start justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-100">
                    {item.menu?.name || `Dish #${item.menu_id}`}
                  </span>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Qty: <strong className="text-brand-400">{item.quantity}</strong> × ₹{item.unit_price}
                  </div>
                  {item.special_instructions && (
                    <div className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded mt-1 border border-amber-500/20">
                      Note: {item.special_instructions}
                    </div>
                  )}
                </div>

                <div className="font-mono font-bold text-slate-200">
                  ₹{(item.unit_price || 0) * item.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Status Flow Transitions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
          {order.status !== 'cooking' && order.status !== 'ready' && order.status !== 'dispatched' && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => onUpdateStatus(order.order_id, 'cooking')}
              icon={<ChefHat className="h-3.5 w-3.5" />}
            >
              Mark In Kitchen Cooking
            </Button>
          )}

          {order.status === 'cooking' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onUpdateStatus(order.order_id, 'ready')}
              icon={<CheckCircle className="h-3.5 w-3.5" />}
            >
              Mark Food Ready
            </Button>
          )}

          {order.status === 'ready' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onUpdateStatus(order.order_id, 'dispatched')}
              icon={<Truck className="h-3.5 w-3.5" />}
            >
              Handover & Dispatch
            </Button>
          )}

          {order.status !== 'cancelled' && order.status !== 'dispatched' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onUpdateStatus(order.order_id, 'cancelled')}
              icon={<Ban className="h-3.5 w-3.5" />}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
