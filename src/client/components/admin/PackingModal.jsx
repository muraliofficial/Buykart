import React, { useState } from 'react';
import { X, PackageCheck, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PackingModal = ({ order, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !order) return null;

  const itemsList = Object.values(order.items || {});
  
  const [packedQuantities, setPackedQuantities] = useState(() => {
    const initial = {};
    itemsList.forEach((item, idx) => {
      initial[idx] = item.quantity || 1;
    });
    return initial;
  });

  const [remarks, setRemarks] = useState(order.packingRemarks || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQtyChange = (idx, value) => {
    setPackedQuantities(prev => ({
      ...prev,
      [idx]: Math.max(0, Number(value))
    }));
  };

  const handleSavePacking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const packedItemsPayload = itemsList.map((item, idx) => ({
      ...item,
      expectedQuantity: item.quantity || 1,
      packedQuantity: packedQuantities[idx] ?? (item.quantity || 1)
    }));

    try {
      await axios.put(`/admin/orders/${order.id}/pack`, {
        packedItems: packedItemsPayload,
        packingRemarks: remarks
      });
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to save packing details');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Packing Module</h3>
              <p className="text-xs text-slate-400">Order #{order.id?.substring(0, 8)} • Customer: {order.userName || order.customerName || 'Customer'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSavePacking} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer & Address Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[10px]">Customer Name</span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{order.userName || order.customerName || 'N/A'}</p>
              <p className="text-slate-500 font-medium">{order.customerMobile || order.shippingDetails?.phone || 'No phone'}</p>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[10px]">Delivery Address</span>
              <p className="font-semibold text-slate-800 leading-snug mt-0.5">
                {order.deliveryAddress || `${order.shippingDetails?.address}, ${order.shippingDetails?.pincode}`}
              </p>
            </div>
          </div>

          {/* Products Packing Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Product Packing Checklist</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-center">Expected Qty</th>
                    <th className="p-3 text-center">Packed Qty</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {itemsList.map((item, idx) => {
                    const expected = item.quantity || 1;
                    const currentPacked = packedQuantities[idx] ?? expected;
                    const isMatched = currentPacked === expected;

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold">{item.itemName}</td>
                        <td className="p-3 text-center font-extrabold text-slate-900">{expected} {item.unit || ''}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min={0}
                            value={currentPacked}
                            onChange={(e) => handleQtyChange(idx, e.target.value)}
                            className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-extrabold text-sm focus:ring-2 focus:ring-purple-600"
                          />
                        </td>
                        <td className="p-3 text-center">
                          {isMatched ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                              <Check className="w-3 h-3" /> Exact
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                              Partial
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Packing Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Packing Remarks / Special Instructions
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Fragile items packed carefully in bubble wrap."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Packing & Set Status to Packed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackingModal;
