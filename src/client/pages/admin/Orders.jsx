import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import PackingModal from '../../components/admin/PackingModal';
import DispatchModal from '../../components/admin/DispatchModal';
import { useToast } from '../../components/common/Toast';
import MaterialIcon from '../../components/common/MaterialIcon';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [searchParams] = useSearchParams();
  const statusFilterParam = searchParams.get('status');

  const { showSuccess, showError } = useToast();

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
      showError('Failed to fetch orders from server.');
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
      showSuccess(`Order status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Error updating order status:', err);
      showError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesId = (o.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = (o.userName || o.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());

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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0D4715] flex items-center justify-center shadow-xs">
              <MaterialIcon name="assignment" size={24} />
            </div>
            <span>Customer Orders & Fulfillment</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Accept incoming orders, verify item packing, assign fleet riders, and manage dispatch
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <MaterialIcon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="max-w-7xl mx-auto bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80 flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <MaterialIcon name="search" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D4715] transition focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <MaterialIcon name="close" size={16} />
            </button>
          )}
        </div>

        {statusFilterParam && (
          <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5">
            <MaterialIcon name="filter_alt" size={16} className="text-[#0D4715]" />
            <span>Filtering: <strong className="text-[#0D4715]">{statusFilterParam}</strong></span>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0D4715] border-t-transparent"></div>
            <p className="text-slate-500 font-bold text-xs">Loading customer orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status & Stage</th>
                  <th className="p-4 text-center">Fulfillment Action</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const itemsList = Object.values(order.items || {});
                  const totalAmount =
                    order.total ||
                    itemsList.reduce(
                      (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
                      0
                    );
                  const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  const isExpanded = expandedOrderId === order.id;
                  const shipping = order.shippingDetails || {};
                  const status = order.status || 'Pending';

                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-mono text-xs font-black text-slate-800 uppercase">
                          #{order.id?.substring(0, 8)}
                        </td>

                        <td className="p-4">
                          <span className="font-extrabold text-slate-900 block">
                            {order.userName || order.customerName || 'Customer'}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {order.customerMobile || shipping.phone || ''}
                          </span>
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
                            className="bg-slate-100 border border-slate-300 text-slate-900 text-xs font-black px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D4715] transition cursor-pointer"
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
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer"
                              >
                                Accept Order
                              </button>
                            )}

                            {(status === 'Accepted' || status === 'Packing') && (
                              <button
                                onClick={() => setPackingOrder(order)}
                                className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <MaterialIcon name="inventory" size={15} />
                                <span>Pack Items</span>
                              </button>
                            )}

                            {status === 'Packed' && (
                              <button
                                onClick={() => setDispatchOrder(order)}
                                className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <MaterialIcon name="send" size={15} />
                                <span>Assign Rider</span>
                              </button>
                            )}

                            {(status === 'Dispatched' || status === 'Out For Delivery') && (
                              <span className="text-[11px] font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                                <MaterialIcon name="two_wheeler" size={15} className="text-amber-600" />
                                <span>{order.assignedRiderName || 'Rider Assigned'}</span>
                              </span>
                            )}

                            {status === 'Delivered' && (
                              <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                                <MaterialIcon name="check_circle" size={15} className="text-emerald-600" filled />
                                <span>Delivered</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                            title="Toggle order details"
                            aria-label="Toggle order details"
                          >
                            <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={20} />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Order Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                          <td colSpan={7} className="p-4 sm:p-6 space-y-4">
                            {order.failureReason && (
                              <div className="bg-rose-50 text-rose-800 p-3 rounded-2xl border border-rose-200 text-xs font-bold flex items-center gap-2">
                                <MaterialIcon name="error" size={18} className="text-rose-600" filled />
                                <span>Delivery Failed Reason: {order.failureReason}</span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Left: Items Breakdown */}
                              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                  <MaterialIcon name="shopping_cart" size={14} className="text-[#0D4715]" />
                                  Ordered Products ({itemsList.length})
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
                              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                  <MaterialIcon name="local_shipping" size={14} className="text-[#0D4715]" />
                                  Destination & Delivery Partner
                                </h4>
                                <div className="space-y-2 text-slate-600">
                                  <div className="flex items-start gap-2">
                                    <MaterialIcon name="location_on" size={16} className="text-[#0D4715] shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Address:</strong> {order.deliveryAddress || `${shipping.address}, ${shipping.pincode}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MaterialIcon name="call" size={16} className="text-[#0D4715] shrink-0" />
                                    <span><strong>Customer Phone:</strong> {order.customerMobile || shipping.phone || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MaterialIcon name="payments" size={16} className="text-[#0D4715] shrink-0" />
                                    <span><strong>Payment Method:</strong> {order.paymentMethod || shipping.paymentMethod || 'COD'}</span>
                                  </div>

                                  {order.assignedRiderName && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-900 font-medium space-y-0.5">
                                      <p className="font-black text-xs flex items-center gap-1">
                                        <MaterialIcon name="two_wheeler" size={16} className="text-amber-700" />
                                        Assigned Rider: {order.assignedRiderName}
                                      </p>
                                      <p className="text-[11px]">Rider Mobile: +91 {order.assignedRiderMobile}</p>
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
          <div className="p-14 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <MaterialIcon name="shopping_bag" size={28} />
            </div>
            <h3 className="text-base font-black text-slate-700">No orders found</h3>
            <p className="text-xs text-slate-400 font-medium">Customer orders will appear here automatically when placed.</p>
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
