import React, { useState, useEffect } from 'react';
import { Truck, Phone, Navigation, CheckCircle2, XCircle, Clock, MapPin, RefreshCw, LogOut, Package, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RiderDashboard = () => {
  const { rider, logoutRider } = useAuth();
  const navigate = useNavigate();

  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedModalOrder, setFailedModalOrder] = useState(null);
  const [failureReason, setFailureReason] = useState('Customer Not Available');
  const [submitting, setSubmitting] = useState(false);

  const fetchRiderOrders = async () => {
    if (!rider) return;
    setLoading(true);
    try {
      const res = await axios.get(`/ontime/rider/${rider.id || rider.mobile}/orders`);
      setAssignedOrders(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rider orders:', err);
      setAssignedOrders([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rider) {
      navigate('/ontime/login');
      return;
    }
    fetchRiderOrders();
  }, [rider]);

  const safeAssignedOrders = Array.isArray(assignedOrders) ? assignedOrders : [];

  const handleUpdateStatus = async (orderId, status, reason = null) => {
    try {
      await axios.put(`/ontime/orders/${orderId}/rider-status`, {
        status,
        failureReason: reason
      });
      fetchRiderOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update delivery status');
    }
  };

  const handleConfirmFailure = async (e) => {
    e.preventDefault();
    if (!failedModalOrder) return;
    setSubmitting(true);
    await handleUpdateStatus(failedModalOrder.id, 'Delivery Failed', failureReason);
    setSubmitting(false);
    setFailedModalOrder(null);
  };

  // Metrics computation
  const todayCount = safeAssignedOrders.length;
  const pendingDeliveries = safeAssignedOrders.filter(o => 
    o.status?.toLowerCase() === 'dispatched' || 
    o.status?.toLowerCase() === 'assigned rider' || 
    o.status?.toLowerCase() === 'out for delivery'
  );
  const completedDeliveries = safeAssignedOrders.filter(o => o.status?.toLowerCase() === 'delivered');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-12">
      {/* Top Mobile Bar */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-white leading-tight">OnTime App</h1>
            <p className="text-[11px] text-amber-400 font-bold">Rider: {rider?.name || 'Active Rider'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRiderOrders}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              logoutRider();
              navigate('/ontime/login');
            }}
            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-5">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-center">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Today's Orders</span>
            <span className="text-xl font-black text-white">{todayCount}</span>
          </div>

          <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30 text-center">
            <span className="text-[10px] font-black uppercase text-amber-400 block">Pending</span>
            <span className="text-xl font-black text-amber-400">{pendingDeliveries.length}</span>
          </div>

          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/30 text-center">
            <span className="text-[10px] font-black uppercase text-emerald-400 block">Completed</span>
            <span className="text-xl font-black text-emerald-400">{completedDeliveries.length}</span>
          </div>
        </div>

        {/* Assigned Orders List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Assigned Deliveries ({safeAssignedOrders.length})</h2>
            <span className="text-xs text-slate-400 font-bold">Auto Synchronized</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400" />
              <p className="text-xs font-bold">Loading assigned delivery orders...</p>
            </div>
          ) : safeAssignedOrders.length === 0 ? (
            <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Deliveries Assigned Yet</h3>
              <p className="text-xs text-slate-400">Orders dispatched by Admin will automatically appear here.</p>
            </div>
          ) : (
            safeAssignedOrders.map((order) => {
              const itemsList = Object.values(order.items || {});
              const phoneNum = order.customerMobile || order.shippingDetails?.phone || '';
              const addressStr = order.deliveryAddress || `${order.shippingDetails?.address}, ${order.shippingDetails?.pincode}`;
              const isOut = order.status === 'Out For Delivery';
              const isDelivered = order.status === 'Delivered';
              const isFailed = order.status === 'Delivery Failed';

              return (
                <div
                  key={order.id}
                  className="bg-slate-800 rounded-3xl border border-slate-700 p-5 space-y-4 shadow-xl"
                >
                  {/* Top Row: ID + Status Badge */}
                  <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
                    <span className="font-mono text-xs font-black text-amber-400">
                      ORDER #{order.id?.substring(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        isDelivered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isFailed
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : isOut
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-1.5 text-xs">
                    <p className="text-base font-black text-white">{order.userName || order.customerName || 'Customer'}</p>
                    
                    {phoneNum && (
                      <p className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> +91 {phoneNum}
                      </p>
                    )}

                    <p className="text-slate-300 leading-relaxed font-medium flex items-start gap-1.5 pt-1">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{addressStr}</span>
                    </p>
                  </div>

                  {/* Items & Payment Info */}
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400 font-bold uppercase text-[10px]">
                      <span>Products ({itemsList.length})</span>
                      <span>Total: <strong className="text-emerald-400 text-sm">₹{order.total}</strong> ({order.paymentMethod || 'COD'})</span>
                    </div>

                    <div className="divide-y divide-slate-800">
                      {itemsList.map((it, idx) => (
                        <div key={idx} className="py-1 text-slate-300 flex justify-between">
                          <span>{it.itemName} (x{it.quantity})</span>
                          <span className="font-bold">₹{Number(it.price || 0) * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.packingRemarks && (
                      <p className="text-[11px] text-amber-300 pt-1 border-t border-slate-800">
                        <strong>Delivery Note:</strong> {order.packingRemarks}
                      </p>
                    )}
                  </div>

                  {/* Failure Alert Reason if failed */}
                  {isFailed && order.failureReason && (
                    <div className="bg-red-500/10 text-red-300 p-2.5 rounded-xl border border-red-500/20 text-xs font-semibold">
                      Reason: {order.failureReason}
                    </div>
                  )}

                  {/* QUICK ACTION BUTTONS */}
                  {!isDelivered && !isFailed && (
                    <div className="space-y-2 pt-2">
                      {/* Top Action Grid: Call & Maps */}
                      <div className="grid grid-cols-2 gap-2">
                        {phoneNum && (
                          <a
                            href={`tel:+91${phoneNum}`}
                            className="py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <Phone className="w-4 h-4 text-emerald-400" />
                            <span>Call Customer</span>
                          </a>
                        )}

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Navigation className="w-4 h-4 text-cyan-400" />
                          <span>Open Maps</span>
                        </a>
                      </div>

                      {/* Main Delivery Workflow Buttons */}
                      {!isOut ? (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'Out For Delivery')}
                          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Start Delivery (Out For Delivery)</span>
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                            className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark Delivered</span>
                          </button>

                          <button
                            onClick={() => setFailedModalOrder(order)}
                            className="py-3 bg-red-600/80 hover:bg-red-600 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Delivery Failed</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Footer Signature */}
        <div className="pt-8 pb-4 text-center text-[10px] text-slate-400 font-medium space-y-1">
          <p>OnTime Rider App v2.5.0 • Powered by Buykart System</p>
          <p>
            Crafted with ❤️ by{' '}
            <a
              href="http://my-self-murali.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 font-extrabold underline hover:text-amber-300 transition"
            >
              Murali (App Creator)
            </a>
          </p>
        </div>
      </div>

      {/* DELIVERY FAILED REASON MODAL */}
      {failedModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm bg-slate-800 text-white rounded-3xl p-6 space-y-4 border border-slate-700">
            <h3 className="text-base font-black flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Select Delivery Failure Reason
            </h3>

            <form onSubmit={handleConfirmFailure} className="space-y-4">
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
              >
                <option value="Customer Not Available">Customer Not Available</option>
                <option value="Wrong Address">Wrong Address</option>
                <option value="Customer Cancelled">Customer Cancelled</option>
                <option value="Other">Other Reason</option>
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFailedModalOrder(null)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md"
                >
                  {submitting ? 'Submitting...' : 'Confirm Delivery Failed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
