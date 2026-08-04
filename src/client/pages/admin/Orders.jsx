import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Search, RefreshCw, CheckCircle2 } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/getOrders');
      setOrders(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesId = o.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = o.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesId || matchesUser;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-[#0D4715]" />
            Customer Orders
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Track completed orders and customer purchase history</p>
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
      <div className="max-w-7xl mx-auto bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
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
              <thead className="bg-slate-50 text-slate-700 text-xs font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Order No</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const itemsList = Object.values(order.items || {});
                  const totalItems = itemsList.reduce((sum, item) => sum + (item.quantity || 1), 0);
                  const totalAmount = itemsList.reduce(
                    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
                    0
                  );
                  const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono text-xs font-bold text-slate-500 uppercase">
                        {order.id?.substring(0, 8)}
                      </td>
                      <td className="p-4 font-bold text-slate-900">{order.userName || 'Unknown'}</td>
                      <td className="p-4 text-slate-600 text-xs">{orderDate}</td>
                      <td className="p-4 text-slate-700 font-semibold">{totalItems} item(s)</td>
                      <td className="p-4 font-extrabold text-[#0D4715]">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {order.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
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
    </div>
  );
};

export default Orders;
