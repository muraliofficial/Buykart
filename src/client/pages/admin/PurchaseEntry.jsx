import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../components/common/Toast';
import MaterialIcon from '../../components/common/MaterialIcon';

const PurchaseEntry = () => {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [vendorName, setVendorName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [purchaseRate, setPurchaseRate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, purRes] = await Promise.all([
        axios.get('/admin/inventory'),
        axios.get('/admin/purchases')
      ]);
      setProducts(Array.isArray(invRes.data) ? invRes.data : []);
      setPurchases(Array.isArray(purRes.data) ? purRes.data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      showError('Failed to load purchase records.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCost = Number(purchaseRate || 0) * Number(quantity || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorName.trim() || !selectedProductId || !quantity) {
      showError('Please fill in vendor name, product, and quantity.');
      return;
    }
    setSubmitting(true);

    const selectedProd = products.find((p) => p.id === selectedProductId);

    try {
      const payload = {
        vendorName: vendorName.trim(),
        invoiceNo: invoiceNo.trim() || `INV-${Date.now()}`,
        date,
        productId: selectedProductId,
        productName: selectedProd?.itemName || 'Product',
        purchaseRate: Number(purchaseRate || 0),
        quantity: Number(quantity || 0),
        totalCost,
        remarks: remarks.trim()
      };

      await axios.post('/admin/purchases', payload);
      setSubmitting(false);
      showSuccess(`Stock Inward Saved: +${quantity} ${selectedProd?.itemName || ''}`);
      
      // Reset Form
      setVendorName('');
      setInvoiceNo('');
      setSelectedProductId('');
      setPurchaseRate('');
      setQuantity('');
      setRemarks('');
      
      fetchData();
    } catch (err) {
      setSubmitting(false);
      showError(err.response?.data?.message || 'Failed to save inward entry.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Stock Inward
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Record supplier purchases and replenish inventory stock
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-2xs disabled:opacity-50"
        >
          <MaterialIcon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PURCHASE ENTRY FORM */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xs border border-slate-200/90 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MaterialIcon name="post_add" size={18} className="text-emerald-700" />
            New Stock Inward
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Vendor Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. FreshAgro Supplies"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice No</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="INV-1024"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
            </div>

            {/* Target Product Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Product <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                required
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.itemName} ({p.unit || ''}) — Current Stock: {p.op_stock || 0}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="50"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
            </div>

            {/* Total Cost Display */}
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl flex justify-between items-center text-xs">
              <span className="font-medium text-slate-500">Calculated Cost:</span>
              <span className="text-base font-bold text-slate-900">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional supplier notes, batch ID..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <MaterialIcon name="check" size={16} />
              <span>{submitting ? 'Recording...' : 'Record Inward'}</span>
            </button>
          </form>
        </div>

        {/* RECENT PURCHASES HISTORY */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl shadow-2xs border border-slate-200/90 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MaterialIcon name="history" size={18} className="text-slate-500" />
              Inward History
            </h2>
            <span className="text-xs text-slate-400">Total: {purchases.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Vendor</th>
                  <th className="py-3 px-3.5">Product</th>
                  <th className="py-3 px-3.5 text-center">Qty Added</th>
                  <th className="py-3 px-3.5 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No stock inward entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3.5">
                        <span className="font-semibold text-slate-900 block">{p.date}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{p.invoiceNo}</span>
                      </td>

                      <td className="py-3 px-3.5 font-medium text-slate-800">{p.vendorName}</td>

                      <td className="py-3 px-3.5">
                        <span className="font-semibold text-slate-900">{p.productName}</span>
                        {p.remarks && <p className="text-[11px] text-slate-400">{p.remarks}</p>}
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold text-xs border border-emerald-200/60">
                          +{p.quantity}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                        ₹{Number(p.totalCost || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PurchaseEntry;
