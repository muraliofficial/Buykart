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
    if (!vendorName || !selectedProductId || !quantity) {
      showError('Please fill in vendor name, product selection, and inward quantity.');
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
      showSuccess(`Stock Inward Saved! ${selectedProd?.itemName || 'Product'} inventory stock increased by ${quantity}.`);
      
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
      showError(err.response?.data?.message || 'Failed to save purchase entry.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0D4715] flex items-center justify-center shadow-xs">
              <MaterialIcon name="post_add" size={24} />
            </div>
            <span>Stock Inward & Purchase Entry</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Record supplier stock purchases to automatically increase inventory opening stock levels
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <MaterialIcon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Records</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PURCHASE ENTRY FORM */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MaterialIcon name="add_circle" size={20} className="text-[#0D4715]" />
            New Stock Inward Entry
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vendor / Supplier Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <MaterialIcon name="store" size={18} />
                </div>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. FreshAgro Supplies Ltd"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Invoice / Bill No</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="INV-9921"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Target Product Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Product to Inward <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D4715] cursor-pointer"
                required
              >
                <option value="">-- Choose Product from Inventory --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.itemName} ({p.unit || ''}) — Current Stock: {p.op_stock || 0}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Purchase Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Quantity Added <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Total Cost Display */}
            <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-2xl flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-900 uppercase text-[10px]">Calculated Cost:</span>
              <span className="text-xl font-black text-[#0D4715]">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Remarks / Batch Info</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Batch number, harvest date, supplier notes"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#0D4715] hover:bg-[#1b5e20] text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <MaterialIcon name="post_add" size={16} />
              <span>{submitting ? 'Recording Inward...' : 'Record Inward & Increase Stock'}</span>
            </button>
          </form>
        </div>

        {/* RECENT PURCHASES HISTORY */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MaterialIcon name="history" size={20} className="text-[#0D4715]" />
              Stock Inward Log
            </h2>
            <span className="text-xs font-bold text-slate-400">Total Logs: {purchases.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Date & Invoice</th>
                  <th className="p-3.5">Vendor</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5 text-center">Qty Added</th>
                  <th className="p-3.5 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">
                      No stock inward purchase entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-900 block">{p.date}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.invoiceNo}</span>
                      </td>

                      <td className="p-3.5 font-bold text-slate-800">{p.vendorName}</td>

                      <td className="p-3.5">
                        <span className="font-bold text-[#0D4715]">{p.productName}</span>
                        {p.remarks && <p className="text-[10px] text-slate-400">{p.remarks}</p>}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs">
                          +{p.quantity}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-black text-slate-900 text-sm">
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
