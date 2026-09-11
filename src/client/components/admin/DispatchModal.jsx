import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MaterialIcon from '../common/MaterialIcon';

const DispatchModal = ({ order, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !order) return null;

  const [riders, setRiders] = useState([]);
  const [selectedRiderId, setSelectedRiderId] = useState(order.assignedRiderId || '');
  const [riderMobile, setRiderMobile] = useState(order.assignedRiderMobile || '');
  const [riderName, setRiderName] = useState(order.assignedRiderName || '');
  const [vehicleDetails, setVehicleDetails] = useState(order.vehicleDetails || '');
  const [dispatchTime, setDispatchTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const [loading, setLoading] = useState(false);
  const [ridersLoading, setRidersLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRiders = async () => {
      setRidersLoading(true);
      try {
        const res = await axios.get('/admin/riders');
        const activeRiders = (res.data || []).filter(
          (r) => !r.status || r.status.toLowerCase() === 'active'
        );
        setRiders(activeRiders);
      } catch (err) {
        console.error('Error loading riders:', err);
      } finally {
        setRidersLoading(false);
      }
    };
    if (isOpen) {
      fetchRiders();
    }
  }, [isOpen]);

  const handleSelectRider = (riderId) => {
    setSelectedRiderId(riderId);
    const selected = riders.find((r) => r.id === riderId);
    if (selected) {
      setRiderName(selected.name);
      setRiderMobile(selected.mobile);
      setVehicleDetails(selected.bikeNumber ? `Bike: ${selected.bikeNumber}` : '');
    }
  };

  const handleConfirmDispatch = async (e) => {
    e.preventDefault();
    if (!selectedRiderId) {
      setError('Please select an active delivery rider');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await axios.put(`/admin/orders/${order.id}/dispatch`, {
        riderId: selectedRiderId,
        riderName,
        riderMobile,
        vehicleDetails,
        dispatchTime,
      });
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to dispatch order');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30">
              <MaterialIcon name="two_wheeler" size={22} />
            </div>
            <div>
              <h3 className="text-base font-black">Dispatch & Rider Assignment</h3>
              <p className="text-xs text-slate-400">Order #{order.id?.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmDispatch} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
              <MaterialIcon name="error" size={18} className="text-rose-600 shrink-0" filled />
              <span>{error}</span>
            </div>
          )}

          {/* Rider Selection Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Active Delivery Rider <span className="text-rose-500">*</span>
            </label>
            {ridersLoading ? (
              <div className="flex items-center gap-2.5 p-3 bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold rounded-2xl">
                <MaterialIcon name="sync" size={16} className="animate-spin text-cyan-600" />
                <span>Loading active OnTime riders...</span>
              </div>
            ) : riders.length > 0 ? (
              <select
                value={selectedRiderId}
                onChange={(e) => handleSelectRider(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-600 cursor-pointer"
                required
              >
                <option value="">-- Choose Assigned Rider --</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (+91 {r.mobile}) {r.bikeNumber ? `- ${r.bikeNumber}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-2xl">
                No active riders found. Please add riders in the Rider Master panel first.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Rider Mobile</label>
              <input
                type="text"
                value={riderMobile}
                onChange={(e) => setRiderMobile(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Dispatch Time</label>
              <input
                type="text"
                value={dispatchTime}
                onChange={(e) => setDispatchTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Vehicle / Bike Details</label>
            <input
              type="text"
              value={vehicleDetails}
              onChange={(e) => setVehicleDetails(e.target.value)}
              placeholder="e.g. Hero Splendor (TN 33 AB 1234)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
            />
          </div>

          <div className="bg-cyan-50 p-3 rounded-2xl border border-cyan-200 text-xs text-cyan-950 font-medium leading-relaxed flex items-center gap-2">
            <MaterialIcon name="info" size={18} className="text-cyan-700 shrink-0" />
            <span>Once dispatched, this delivery will sync instantly to the rider's <strong>OnTime App</strong>.</span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRiderId}
              className="px-6 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <MaterialIcon
                name={loading ? 'sync' : 'send'}
                size={16}
                className={loading ? 'animate-spin' : ''}
              />
              <span>{loading ? 'Dispatching Order...' : 'Confirm Dispatch & Out for Delivery'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DispatchModal;
