import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ShoppingBag, Users, TrendingUp, Clock, ShoppingCart, UserPlus, RefreshCw } from 'lucide-react';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: [],
    orders: [],
    users: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [inventoryRes, ordersRes, usersRes] = await Promise.all([
        axios.get('/getInventory'),
        axios.get('/getOrders'),
        axios.get('/getUsers'),
      ]);

      setStats({
        products: inventoryRes.data || [],
        orders: ordersRes.data || [],
        users: usersRes.data || [],
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Failed to fetch dashboard data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute summary stats
  const totalProducts = stats.products.length;
  const totalInventoryValue = stats.products.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.op_stock || 0),
    0
  );
  const totalOrders = stats.orders.length;
  const totalUsers = stats.users.length;

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

  stats.orders.forEach((order) => {
    if (!order.createdAt) return;
    const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
    if (salesByDay.hasOwnProperty(dateKey)) {
      const orderTotal = Object.values(order.items || {}).reduce(
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
    ...stats.orders.map((o) => ({
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
    ...stats.users.map((u) => ({
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Overview of store inventory, orders, and sales performance</p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Products */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</span>
              <p className="text-3xl font-extrabold text-slate-900">{totalProducts}</p>
              <p className="text-xs text-slate-500 font-medium">
                Stock Value: <strong className="text-slate-800">₹{totalInventoryValue.toLocaleString('en-IN')}</strong>
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-[#0D4715] rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
              <p className="text-3xl font-extrabold text-slate-900">{totalOrders}</p>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Live sales active
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Registered Users */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
              <p className="text-3xl font-extrabold text-slate-900">{totalUsers}</p>
              <p className="text-xs text-slate-500 font-medium">Registered customers</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Store Status */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between hover:shadow-md transition">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Store Status</span>
              <p className="text-xl font-extrabold text-emerald-600">Active</p>
              <p className="text-xs text-slate-500 font-medium">Server Online (Port 3000)</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Analytics & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Sales Overview (Last 7 Days)</h2>
              <span className="text-xs font-semibold text-slate-400">Revenue in INR (₹)</span>
            </div>
            <div className="h-72">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              Recent Activity
            </h2>

            {recentActivities.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {recentActivities.map((act, index) => (
                  <div key={index} className="flex items-start gap-3.5 text-sm">
                    {act.type === 'order' ? (
                      <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <UserPlus className="w-4 h-4" />
                      </div>
                    )}

                    <div className="space-y-0.5 flex-1">
                      {act.type === 'order' ? (
                        <>
                          <p className="font-bold text-slate-900 text-xs">
                            Order by <span className="text-[#0D4715]">{act.data.userName || 'Customer'}</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            Order ID: <span className="font-mono">{act.data.id?.substring(0, 8)}</span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-900 text-xs">
                            New User: <span className="text-purple-700">{act.data.name}</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            Phone: <span>{act.data.phone || 'N/A'}</span>
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
