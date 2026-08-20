import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ShoppingBag, ArrowLeft, MapPin, Phone, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProductImageUrl } from '../../utils/imageHelper';

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
    { key: 'Pending', label: 'Order Placed' },
    { key: 'Accepted', label: 'Accepted' },
    { key: 'Packing', label: 'Packing' },
    { key: 'Packed', label: 'Packed' },
    { key: 'Dispatched', label: 'Dispatched' },
    { key: 'Out For Delivery', label: 'Out For Delivery' },
    { key: 'Delivered', label: 'Delivered' }
  ];

  const getStageIndex = (status = 'Pending') => {
    const s = status.toLowerCase();
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
    const s = status.toLowerCase();
    if (s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
        </span>
      );
    }
    if (s === 'delivery failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-extrabold">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Delivery Failed
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-extrabold">
          <AlertCircle className="w-3.5 h-3.5 text-gray-600" /> Cancelled
        </span>
      );
    }
    if (s === 'out for delivery') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-extrabold animate-pulse">
          <Truck className="w-3.5 h-3.5 text-amber-600" /> Out For Delivery
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-extrabold">
        <Clock className="w-3.5 h-3.5 text-blue-600" /> {status}
      </span>
    );
  };

  if (!activeUser) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md text-center max-w-md space-y-4">
          <Package className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">Please Log In</h2>
          <p className="text-sm text-gray-500">You must be logged in to view your order history and live tracking.</p>
          <Link
            to="/account"
            className="inline-block bg-[#0D4715] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#41644A] transition shadow-md"
          >
            Go to Account Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-[#0D4715]" />
              My Orders & Live Tracking
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Track real-time status updates from store to delivery</p>
          </div>
          <button
            onClick={fetchUserOrders}
            className="text-xs font-bold text-[#0D4715] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
          >
            Refresh Live Status
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0D4715] border-t-transparent"></div>
            <p className="text-gray-500 font-semibold text-sm">Fetching live order updates...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 space-y-4 max-w-md mx-auto">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
            <h2 className="text-xl font-bold text-gray-800">No Orders Placed Yet</h2>
            <p className="text-gray-500 text-sm">When you place an order, live tracking will appear here.</p>
            <Link
              to="/"
              className="inline-block bg-[#0D4715] hover:bg-[#41644A] text-white font-bold px-6 py-3 rounded-xl transition shadow-md text-sm"
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
                  className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-6 transition hover:shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black text-[#0D4715] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                          #{order.id?.substring(0, 8).toUpperCase()}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Placed: {dateStr}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-gray-400 block font-medium">Order Total</span>
                      <span className="text-2xl font-black text-[#0D4715]">
                        ₹{Number(orderTotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* STEP-BY-STEP TRACKING TIMELINE */}
                  {!isFailed && !isCancelled ? (
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-600">
                          Live Tracking Timeline
                        </h4>
                        {order.assignedRiderName && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" /> Rider: {order.assignedRiderName} (+91 {order.assignedRiderMobile})
                          </span>
                        )}
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="relative flex items-center justify-between px-2 pt-2">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 -translate-y-1/2 z-0">
                          <div
                            className="h-full bg-[#0D4715] transition-all duration-500"
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
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isCurrent
                                    ? 'bg-[#0D4715] text-white ring-4 ring-emerald-100 scale-110 shadow-lg'
                                    : isDone
                                    ? 'bg-[#0D4715] text-white'
                                    : 'bg-white text-gray-400 border-2 border-gray-300'
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-bold mt-2 text-center max-w-[60px] leading-tight ${
                                  isCurrent
                                    ? 'text-[#0D4715] font-black'
                                    : isDone
                                    ? 'text-gray-800'
                                    : 'text-gray-400'
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
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs text-red-800 font-medium flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                      <div>
                        <p className="font-bold">Delivery Status Alert: {order.status}</p>
                        {order.failureReason && (
                          <p className="text-red-700 mt-0.5">Reason: <strong className="font-bold">{order.failureReason}</strong></p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Purchased Items List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Products</h4>
                    <div className="divide-y divide-gray-100 bg-gray-50/50 p-3 rounded-2xl">
                      {itemsList.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImageUrl(item)}
                              alt={item.itemName}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80';
                              }}
                            />
                            <div>
                              <p className="font-bold text-gray-900 text-xs">{item.itemName}</p>
                              <p className="text-[11px] text-gray-500">
                                ₹{item.price} × {item.quantity} {item.unit || ''}
                              </p>
                            </div>
                          </div>

                          <span className="font-bold text-gray-900 text-xs">
                            ₹{Number(item.price || 0) * (item.quantity || 1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address & Payment Summary */}
                  {(order.deliveryAddress || order.shippingDetails) && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800">
                          <MapPin className="w-3.5 h-3.5 text-[#0D4715]" />
                          <span>Delivery Address:</span>
                        </div>
                        <p className="pl-5 leading-relaxed font-medium text-gray-700">
                          {order.deliveryAddress || `${order.shippingDetails?.address}, ${order.shippingDetails?.pincode}`}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800">
                          <CreditCard className="w-3.5 h-3.5 text-[#0D4715]" />
                          <span>Payment Method:</span>
                        </div>
                        <p className="pl-5 font-bold text-gray-800">
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
