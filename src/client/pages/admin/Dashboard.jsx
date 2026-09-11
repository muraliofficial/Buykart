import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import MaterialIcon from '../../components/common/MaterialIcon';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: [],
    orders: [],
    users: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, ordersRes, usersRes] = await Promise.all([
        axios.get('/admin/inventory'),
        axios.get('/admin/orders'),
        axios.get('/admin/users'),
      ]);

      setStats({
        products: Array.isArray(inventoryRes.data) ? inventoryRes.data : [],
        orders: Array.isArray(ordersRes.data) ? ordersRes.data : [],
        users: Array.isArray(usersRes.data) ? usersRes.data : [],
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const safeProducts = Array.isArray(stats.products) ? stats.products : [];
  const safeOrders = Array.isArray(stats.orders) ? stats.orders : [];
  const safeUsers = Array.isArray(stats.users) ? stats.users : [];

  // Compute summary stats
  const totalProducts = safeProducts.length;
  const totalInventoryValue = safeProducts.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.op_stock || 0),
    0
  );
  const totalOrders = safeOrders.length;
  const totalUsers = safeUsers.length;

  // Process Sales Chart (Last 7 Days)
  const salesByDay = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    salesByDay[key] = 0;
  }

  safeOrders.forEach((order) => {
    if (!order.createdAt) return;
    const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
    if (salesByDay.hasOwnProperty(dateKey)) {
      const orderTotal = Number(order.total) || Object.values(order.items || {}).reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      );
      salesByDay[dateKey] += orderTotal;
    }
  });

  const chartLabels = Object.keys(salesByDay).map((dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  });

  const chartDataValues = Object.values(salesByDay);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Sales Amount (₹)',
        data: chartDataValues,
        borderColor: '#0D4715',
        backgroundColor: 'rgba(13, 71, 21, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0D4715',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Sales: ₹${context.parsed.y.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  // Recent Activity Feed
  const recentActivities = [
    ...safeOrders.map((o) => ({
      type: 'order',
      timestamp: new Date(o.createdAt || Date.now()).getTime(),
      dateStr: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      data: o,
    })),
    ...safeUsers.map((u) => ({
      type: 'user',
      timestamp: new Date(u.createdAt || Date.now()).getTime(),
      dateStr: new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      data: u,
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  // Auto polling for live new order notifications
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [prevOrderCount, setPrevOrderCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('/admin/orders');
        const latestOrders = Array.isArray(res.data) ? res.data : [];
        if (prevOrderCount > 0 && latestOrders.length > prevOrderCount) {
          const newest = latestOrders[0];
          setNewOrderAlert(newest);
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
          } catch (e) {}
        }
        setPrevOrderCount(latestOrders.length);
        setStats((prev) => ({ ...prev, orders: latestOrders }));
      } catch (e) {}
    }, 6000);

    return () => clearInterval(interval);
  }, [prevOrderCount]);

  // Compute status counts
  const ordersList = safeOrders;
  const statusCounts = {
    pending: ordersList.filter((o) => !o.status || o.status.toLowerCase() === 'pending').length,
    accepted: ordersList.filter((o) => o.status && o.status.toLowerCase() === 'accepted').length,
    packing: ordersList.filter((o) => o.status && o.status.toLowerCase() === 'packing').length,
    packed: ordersList.filter((o) => o.status && o.status.toLowerCase() === 'packed').length,
    dispatched: ordersList.filter(
      (o) =>
        o.status && (o.status.toLowerCase() === 'dispatched' || o.status.toLowerCase() === 'assigned rider')
    ).length,
    outForDelivery: ordersList.filter((o) => o.status && o.status.toLowerCase() === 'out for delivery').length,
    delivered: ordersList.filter((o) => o.status && o.status.toLowerCase() === 'delivered').length,
    cancelled: ordersList.filter(
      (o) => o.status && (o.status.toLowerCase() === 'cancelled' || o.status.toLowerCase() === 'delivery failed')
    ).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Live Order Instant Notification Banner */}
      {newOrderAlert && (
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
              <MaterialIcon name="shopping_bag" size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
                NEW LIVE ORDER RECEIVED
              </span>
              <h4 className="text-sm font-extrabold mt-1">
                Order #{newOrderAlert.id?.substring(0, 8).toUpperCase()} • {newOrderAlert.userName || newOrderAlert.customerName || 'Customer'} (₹{newOrderAlert.total || '0'})
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/orders"
              className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-100 transition shadow-md"
            >
              View Orders
            </Link>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="text-white/80 hover:text-white p-1 rounded-lg"
              aria-label="Dismiss banner"
            >
              <MaterialIcon name="close" size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0D4715] flex items-center justify-center shadow-xs">
              <MaterialIcon name="dashboard" size={24} />
            </div>
            <span>Operations & Store Metrics</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Real-time fulfillment tracking across Storefront, Admin Panel, and OnTime Rider App
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <MaterialIcon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* TOP SUMMARY KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Products</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalProducts}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">In Catalog</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0D4715] flex items-center justify-center">
              <MaterialIcon name="inventory_2" size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inventory Valuation</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">₹{totalInventoryValue.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Asset Stock Value</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0D4715] flex items-center justify-center">
              <MaterialIcon name="account_balance_wallet" size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalOrders}</h3>
              <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Lifetime Placed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MaterialIcon name="assignment" size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Registered Users</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalUsers}</h3>
              <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Staff & Customers</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MaterialIcon name="group" size={24} />
            </div>
          </div>
        </div>

        {/* ORDER STATUS CARDS GRID */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MaterialIcon name="tune" size={16} className="text-[#0D4715]" />
            Live Fulfillment Pipeline
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <Link
              to="/admin/orders?status=Pending"
              className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl text-amber-900 hover:shadow-md transition text-center hover:scale-[1.02]"
            >
              <span className="text-[10px] font-black uppercase text-amber-700 block">Pending</span>
              <span className="text-2xl font-black">{statusCounts.pending}</span>
            </Link>

            <Link
              to="/admin/orders?status=Accepted"
              className="bg-blue-50/80 border border-blue-200/80 p-3.5 rounded-2xl text-blue-900 hover:shadow-md transition text-center hover:scale-[1.02]"
            >
              <span className="text-[10px] font-black uppercase text-blue-700 block">Accepted</span>
              <span className="text-2xl font-black">{statusCounts.accepted}</span>
            </Link>

            <Link
              to="/admin/orders?status=Packing"
              className="bg-indigo-50/80 border border-indigo-200/80 p-3.5 rounded-2xl text-indigo-900 hover:shadow-md transition text-center hover:scale-[1.02]"
            >
              <span className="text-[10px] font-black uppercase text-indigo-700 block">Packing</span>
              <span className="text-2xl font-black">{statusCounts.packing}</span>
            </Link>

            <Link
              to="/admin/orders?status=Packed"
              className="bg-purple-50/80 border border-purple-200/80 p-3.5 rounded-2xl text-purple-900 hover:shadow-md transition text-center hover:scale-[1.02]"
            >
              <span className="text-[10px] font-black uppercase text-purple-700 block">Packed</span>
              <span className="text-2xl font-black">{statusCounts.packed}</span>
            </Link>

            <Link
              to="/admin/orders?status=Dispatched"
              className="bg-cyan-50/80 border border-cyan-200/80 p-3.5 rounded-2xl text-cyan-900 hover:shadow-md transition text-center hover:scale-[1.02]"
            >
              <span className="text-[10px] font-black uppercase text-cyan-700 block">Dispatched</span>
              <span className="text-2xl font-black">{statusCounts.dispatched}</span>
            </Link>

            <Link
              to="/admin/orders?status=OutForDelivery"
              className="bg-orange-50/80 border border-orange-200/80 p-3.5 rounded-2xl text-orange-900 hover:shadow-md transition text-center hover:scale-[1.02]"
            >
              <span className="text-[10px] font-black uppercase text-orange-700 block">Out For Delivery</span>
              <span className="text-2xl font-black">{statusCounts.outForDelivery}</span>
            </Link>

            <Link
              to="/admin/orders?status=Delivered"
              className="bg-emerald-50/80 border border-emerald-200/80 p-3.5 rounded-2xl text-emerald-900 hover:shadow-md transition text-center hover:scale-[1.02]"
            >
              <span className="text-[10px] font-black uppercase text-emerald-700 block">Delivered</span>
              <span className="text-2xl font-black">{statusCounts.delivered}</span>
            </Link>

            <Link
              to="/admin/orders?status=Cancelled"
              className="bg-rose-50/80 border border-rose-200/80 p-3.5 rounded-2xl text-rose-900 hover:shadow-md transition text-center hover:scale-[1.02]"
            >
              <span className="text-[10px] font-black uppercase text-rose-700 block">Cancelled</span>
              <span className="text-2xl font-black">{statusCounts.cancelled}</span>
            </Link>
          </div>
        </div>

        {/* Analytics & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MaterialIcon name="show_chart" size={20} className="text-[#0D4715]" />
                Sales Trends (Last 7 Days)
              </h2>
              <span className="text-xs font-bold text-slate-400">Revenue in INR (₹)</span>
            </div>
            <div className="h-72">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
              <MaterialIcon name="history" size={20} className="text-[#0D4715]" />
              Recent System Events
            </h2>

            {recentActivities.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {recentActivities.map((act, index) => (
                  <div key={index} className="flex items-start gap-3.5 text-sm">
                    {act.type === 'order' ? (
                      <div className="w-9 h-9 bg-emerald-100 text-[#0D4715] rounded-2xl flex items-center justify-center shrink-0 mt-0.5">
                        <MaterialIcon name="shopping_cart" size={18} />
                      </div>
                    ) : (
                      <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shrink-0 mt-0.5">
                        <MaterialIcon name="person_add" size={18} />
                      </div>
                    )}

                    <div className="space-y-0.5 flex-1 min-w-0">
                      {act.type === 'order' ? (
                        <>
                          <p className="font-bold text-slate-900 text-xs truncate">
                            Order by <span className="text-[#0D4715] font-black">{act.data.customerName || act.data.userName || 'Customer'}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            ID: <span className="font-mono">{act.data.id?.substring(0, 8).toUpperCase()}</span> • Total: ₹{act.data.total || 0}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-900 text-xs truncate">
                            New Account: <span className="text-purple-700 font-black">{act.data.name}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            Mobile: <span>{act.data.mobile || act.data.phone || 'N/A'}</span>
                          </p>
                        </>
                      )}
                      <span className="text-[10px] text-slate-400 block font-medium">{act.dateStr}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-8">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
