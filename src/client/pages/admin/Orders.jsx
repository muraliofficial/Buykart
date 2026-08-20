import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Search, RefreshCw, ChevronDown, ChevronUp, MapPin, CreditCard, Phone, PackageCheck, Send, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PackingModal from '../../components/admin/PackingModal';
import DispatchModal from '../../components/admin/DispatchModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [searchParams] = useSearchParams();
  const statusFilterParam = searchParams.get('status');

  // Modals state
  const [packingOrder, setPackingOrder] = useState(null);
  const [dispatchOrder, setDispatchOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/orders');
      setOrders(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesId = o.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = (o.userName || o.customerName)?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilterParam) {
      const cleanParam = statusFilterParam.toLowerCase().replace(/\s+/g, '');
      const cleanStatus = (o.status || '').toLowerCase().replace(/\s+/g, '');
      if (cleanParam === 'cancelled') {
        matchesStatus = cleanStatus === 'cancelled' || cleanStatus === 'deliveryfailed';
      } else {
        matchesStatus = cleanStatus === cleanParam;
      }
    }

    return (matchesId || matchesUser) && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-[#0D4715]" />
            Live Customer Orders & Fulfillments
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Accept orders, pack products, assign riders, and dispatch</p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="max-w-7xl mx-auto bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4715] transition"
          />
        </div>

        {statusFilterParam && (
          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Filtering Status: <span className="text-[#0D4715] font-extrabold">{statusFilterParam}</span>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0D4715] animate-spin mx-auto" />
            <p className="text-slate-500 font-semibold text-sm">Loading customer orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Info</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status & Workflow</th>
                  <th className="p-4 text-center">Fulfillment Actions</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const itemsList = Object.values(order.items || {});
                  const totalItems = itemsList.reduce((sum, item) => sum + (item.quantity || 1), 0);
                  const totalAmount = order.total || itemsList.reduce(
                    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
                    0
                  );
                  const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A';

                  const isExpanded = expandedOrderId === order.id;
                  const shipping = order.shippingDetails || {};
                  const status = order.status || 'Pending';

                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-mono text-xs font-black text-slate-700 uppercase">
                          #{order.id?.substring(0, 8)}
                        </td>

                        <td className="p-4">
                          <span className="font-extrabold text-slate-900 block">{order.userName || order.customerName || 'Customer'}</span>
                          <span className="text-xs text-slate-500 font-medium">{order.customerMobile || shipping.phone || ''}</span>
                        </td>

                        <td className="p-4 text-slate-600 text-xs font-medium">{orderDate}</td>

                        <td className="p-4 font-black text-[#0D4715]">
                          ₹{Number(totalAmount).toLocaleString('en-IN')}
                        </td>

                        <td className="p-4">
                          <select
                            value={status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="bg-slate-100 border border-slate-300 text-slate-900 text-xs font-extrabold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D4715] transition cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Packing">Packing</option>
                            <option value="Packed">Packed</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Out For Delivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Delivery Failed">Delivery Failed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* FULFILLMENT WORKFLOW BUTTONS */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {status === 'Pending' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'Accepted')}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-lg shadow-xs transition cursor-pointer"
                              >
                                Accept Order
                              </button>
                            )}

                            {(status === 'Accepted' || status === 'Packing') && (
                              <button
                                onClick={() => setPackingOrder(order)}
                                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>Perform Packing</span>
                              </button>
                            )}

                            {status === 'Packed' && (
                              <button
                                onClick={() => setDispatchOrder(order)}
                                className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-extrabold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Dispatch & Rider</span>
                              </button>
                            )}

                            {(status === 'Dispatched' || status === 'Out For Delivery') && (
                              <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                                <Truck className="w-3 h-3" /> Rider: {order.assignedRiderName || 'Assigned'}
                              </span>
                            )}

                            {status === 'Delivered' && (
                              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Fulfill Complete
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                            title="Toggle order details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Order Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                          <td colSpan={7} className="p-4 sm:p-6 space-y-4">
                            {order.failureReason && (
                              <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-200 text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span>Delivery Failed Reason: {order.failureReason}</span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Left: Items Breakdown */}
                              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                                  Purchased Items ({itemsList.length})
                                </h4>
                                <div className="divide-y divide-slate-100">
                                  {itemsList.map((it, idx) => (
                                    <div key={idx} className="py-2 flex justify-between items-center text-slate-700">
                                      <span className="font-semibold">{it.itemName} (x{it.quantity})</span>
                                      <span className="font-bold text-slate-900">₹{Number(it.price || 0) * it.quantity}</span>
                                    </div>
                                  ))}
                                </div>

                                {order.packingRemarks && (
                                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                                    <strong>Packing Remarks:</strong> {order.packingRemarks}
                                  </div>
                                )}
                              </div>

                              {/* Right: Customer Shipping & Payment Info */}
                              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                                  Shipping & Rider Assignment
                                </h4>
                                <div className="space-y-2 text-slate-600">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-[#0D4715] shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Address:</strong> {order.deliveryAddress || `${shipping.address}, ${shipping.pincode}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-[#0D4715] shrink-0" />
                                    <span><strong>Customer Phone:</strong> {order.customerMobile || shipping.phone || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-[#0D4715] shrink-0" />
                                    <span><strong>Payment Method:</strong> {order.paymentMethod || shipping.paymentMethod || 'COD'}</span>
                                  </div>

                                  {order.assignedRiderName && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 font-medium">
                                      <p className="font-bold text-xs flex items-center gap-1">
                                        <Truck className="w-4 h-4 text-amber-700" /> Assigned Rider: {order.assignedRiderName}
                                      </p>
                                      <p className="text-[11px]">Rider Contact: +91 {order.assignedRiderMobile}</p>
                                      {order.vehicleDetails && <p className="text-[11px]">Vehicle: {order.vehicleDetails}</p>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No orders found</h3>
            <p className="text-xs text-slate-400">Customer orders will appear here as soon as they are placed.</p>
          </div>
        )}
      </div>

      {/* PACKING MODAL */}
      {packingOrder && (
        <PackingModal
          order={packingOrder}
          isOpen={!!packingOrder}
          onClose={() => setPackingOrder(null)}
          onSuccess={() => {
            setPackingOrder(null);
            fetchOrders();
          }}
        />
      )}

      {/* DISPATCH MODAL */}
      {dispatchOrder && (
        <DispatchModal
          order={dispatchOrder}
          isOpen={!!dispatchOrder}
          onClose={() => setDispatchOrder(null)}
          onSuccess={() => {
            setDispatchOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default Orders;
