import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProductImageUrl, DEFAULT_PRODUCT_IMAGE } from '../../utils/imageHelper';
import MaterialIcon from '../../components/common/MaterialIcon';

const MyOrders = () => {
  const { customer } = useAuth();
  const activeUser = customer;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserOrders = async () => {
    if (!activeUser) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeUser.id) params.append('customerId', activeUser.id);
      if (activeUser.mobile) params.append('mobile', activeUser.mobile);

      const response = await axios.get(`/website/orders?${params.toString()}`);
      const userOrders = Array.isArray(response.data) ? response.data : [];
      setOrders(userOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError('Failed to load your orders.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [activeUser]);

  const ORDER_STAGES = [
    { key: 'Pending', label: 'Placed' },
    { key: 'Accepted', label: 'Accepted' },
    { key: 'Packing', label: 'Packing' },
    { key: 'Packed', label: 'Packed' },
    { key: 'Dispatched', label: 'Dispatched' },
    { key: 'Out For Delivery', label: 'On Way' },
    { key: 'Delivered', label: 'Delivered' }
  ];

  const getStageIndex = (status = 'Pending') => {
    const s = String(status || '').toLowerCase();
    if (s === 'pending') return 0;
    if (s === 'accepted') return 1;
    if (s === 'packing') return 2;
    if (s === 'packed') return 3;
    if (s === 'dispatched' || s === 'assigned rider') return 4;
    if (s === 'out for delivery') return 5;
    if (s === 'delivered') return 6;
    return 0;
  };

  const getStatusBadge = (status = 'Pending') => {
    const s = String(status || '').toLowerCase();
    if (s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black">
          <MaterialIcon name="check_circle" size={16} filled className="text-emerald-600" /> Delivered
        </span>
      );
    }
    if (s === 'delivery failed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-black">
          <MaterialIcon name="cancel" size={16} filled className="text-rose-600" /> Delivery Failed
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-black">
          <MaterialIcon name="block" size={16} className="text-slate-600" /> Cancelled
        </span>
      );
    }
    if (s === 'out for delivery') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black animate-pulse">
          <MaterialIcon name="two_wheeler" size={16} className="text-amber-600" /> Out For Delivery
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black">
        <MaterialIcon name="schedule" size={16} className="text-blue-600" /> {status}
      </span>
    );
  };

  if (!activeUser) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md text-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <MaterialIcon name="account_circle" size={36} />
          </div>
          <h2 className="text-xl font-black text-slate-800">Please Log In</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            You must be logged in to view your past orders, delivery details, and live delivery tracking.
          </p>
          <Link
            to="/account"
            className="inline-block bg-[#0D4715] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-[#1b5e20] transition shadow-md"
          >
            Go to Customer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#0D4715] flex items-center justify-center shadow-xs">
              <MaterialIcon name="receipt_long" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                My Orders & Live Tracking
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time status updates from order dispatch to doorstep</p>
            </div>
          </div>
          <button
            onClick={fetchUserOrders}
            className="flex items-center gap-1 text-xs font-bold text-[#0D4715] bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200/80 hover:bg-emerald-100 transition cursor-pointer"
          >
            <MaterialIcon name="refresh" size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0D4715] border-t-transparent"></div>
            <p className="text-slate-500 font-bold text-xs">Fetching live order updates...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200/80 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MaterialIcon name="receipt_long" size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800">No Orders Placed Yet</h2>
            <p className="text-slate-500 text-xs font-medium">When you place an order, live tracking and receipts will appear here.</p>
            <Link
              to="/"
              className="inline-block bg-[#0D4715] hover:bg-[#1b5e20] text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md text-xs mt-2"
            >
              Start Shopping Now
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const itemsList = Object.values(order.items || {});
              const orderTotal = order.total || itemsList.reduce(
                (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
                0
              );
              const dateStr = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A';

              const currentStageIdx = getStageIndex(order.status);
              const isFailed = order.status === 'Delivery Failed';
              const isCancelled = order.status === 'Cancelled';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 space-y-6 transition hover:shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black text-[#0D4715] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          #{order.id?.substring(0, 8).toUpperCase()}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">Placed: {dateStr}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block font-bold uppercase">Order Total</span>
                      <span className="text-2xl font-black text-[#0D4715]">
                        ₹{Number(orderTotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* STEP-BY-STEP TRACKING TIMELINE */}
                  {!isFailed && !isCancelled ? (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <MaterialIcon name="timeline" size={16} className="text-[#0D4715]" />
                          Delivery Progress
                        </h4>
                        {order.assignedRiderName && (
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
                            <MaterialIcon name="two_wheeler" size={16} className="text-amber-600" />
                            Rider: {order.assignedRiderName} (+91 {order.assignedRiderMobile})
                          </span>
                        )}
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="relative flex items-center justify-between px-2 pt-2">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0">
                          <div
                            className="h-full bg-[#0D4715] transition-all duration-500 rounded-full"
                            style={{
                              width: `${(currentStageIdx / (ORDER_STAGES.length - 1)) * 100}%`
                            }}
                          ></div>
                        </div>

                        {/* Stage Dots */}
                        {ORDER_STAGES.map((stage, idx) => {
                          const isDone = idx <= currentStageIdx;
                          const isCurrent = idx === currentStageIdx;

                          return (
                            <div key={stage.key} className="relative z-10 flex flex-col items-center group">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                                  isCurrent
                                    ? 'bg-[#0D4715] text-white ring-4 ring-emerald-100 scale-110 shadow-lg'
                                    : isDone
                                    ? 'bg-[#0D4715] text-white'
                                    : 'bg-white text-slate-400 border-2 border-slate-300'
                                }`}
                              >
                                {isDone ? (
                                  <MaterialIcon name="check" size={16} />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-bold mt-2 text-center max-w-[55px] leading-tight ${
                                  isCurrent
                                    ? 'text-[#0D4715] font-black'
                                    : isDone
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                                }`}
                              >
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-3">
                      <MaterialIcon name="error" size={24} className="text-rose-600 shrink-0" filled />
                      <div>
                        <p className="font-bold">Delivery Status Alert: {order.status}</p>
                        {order.failureReason && (
                          <p className="text-rose-700 mt-0.5">Reason: <strong>{order.failureReason}</strong></p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Purchased Items List */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Items</h4>
                    <div className="divide-y divide-slate-100 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      {itemsList.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImageUrl(item)}
                              alt={item.itemName}
                              className="w-10 h-10 rounded-xl object-cover bg-white shrink-0 border border-slate-200/60"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_PRODUCT_IMAGE;
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{item.itemName}</p>
                              <p className="text-[11px] text-slate-500 font-semibold">
                                ₹{item.price} × {item.quantity} {item.unit || ''}
                              </p>
                            </div>
                          </div>

                          <span className="font-black text-slate-900 text-xs">
                            ₹{Number(item.price || 0) * (item.quantity || 1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address & Payment Summary */}
                  {(order.deliveryAddress || order.shippingDetails) && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <MaterialIcon name="location_on" size={16} className="text-[#0D4715]" />
                          <span>Delivery Address:</span>
                        </div>
                        <p className="pl-5 leading-relaxed font-medium text-slate-700">
                          {order.deliveryAddress || `${order.shippingDetails?.address}, ${order.shippingDetails?.pincode}`}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <MaterialIcon name="payments" size={16} className="text-[#0D4715]" />
                          <span>Payment Method:</span>
                        </div>
                        <p className="pl-5 font-bold text-slate-800">
                          {order.paymentMethod || order.shippingDetails?.paymentMethod || 'Cash On Delivery (COD)'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
