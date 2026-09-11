import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl, DEFAULT_PRODUCT_IMAGE } from '../../utils/imageHelper';
import MaterialIcon from '../../components/common/MaterialIcon';

const MyOrders = () => {
  const navigate = useNavigate();
  const { customer } = useAuth();
  const { addToCart } = useCart();
  const activeUser = customer;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and UI State
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'active', 'delivered', 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [expandedTimelines, setExpandedTimelines] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

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

  // Lock background scroll when Receipt modal is open
  useEffect(() => {
    if (receiptOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [receiptOrder]);

  const ORDER_STAGES = [
    { key: 'Pending', label: 'Placed', icon: 'receipt_long' },
    { key: 'Accepted', label: 'Confirmed', icon: 'thumb_up' },
    { key: 'Packing', label: 'Packing', icon: 'inventory_2' },
    { key: 'Packed', label: 'Packed', icon: 'inventory' },
    { key: 'Dispatched', label: 'Assigned', icon: 'two_wheeler' },
    { key: 'Out For Delivery', label: 'On Way', icon: 'navigation' },
    { key: 'Delivered', label: 'Delivered', icon: 'verified' }
  ];

  const getStageDescription = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'pending') return 'Order received! Awaiting store confirmation.';
    if (s === 'accepted') return 'Order confirmed by store. Preparing items for packaging.';
    if (s === 'packing') return 'Items are being freshly inspected, weighed & packed.';
    if (s === 'packed') return 'Package sealed & bagged. Awaiting rider pickup.';
    if (s === 'dispatched' || s === 'assigned rider') return 'Delivery rider assigned and heading to fulfillment hub.';
    if (s === 'out for delivery') return 'Your rider is on the way to your doorstep right now!';
    if (s === 'delivered') return 'Order successfully delivered to your doorstep. Thank you!';
    return 'Processing your order with utmost care.';
  };

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

  const isOrderActive = (status) => {
    const s = String(status || '').toLowerCase();
    return s !== 'delivered' && s !== 'cancelled' && s !== 'delivery failed';
  };

  const getStatusBadge = (status = 'Pending') => {
    const s = String(status || '').toLowerCase();
    if (s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-black border border-emerald-200/80 shadow-2xs">
          <MaterialIcon name="check_circle" size={15} filled className="text-emerald-600" />
          <span>Delivered</span>
        </span>
      );
    }
    if (s === 'delivery failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 rounded-full text-xs font-black border border-rose-200 shadow-2xs">
          <MaterialIcon name="cancel" size={15} filled className="text-rose-600" />
          <span>Delivery Failed</span>
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-black border border-slate-200 shadow-2xs">
          <MaterialIcon name="block" size={15} className="text-slate-500" />
          <span>Cancelled</span>
        </span>
      );
    }
    if (s === 'out for delivery') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 rounded-full text-xs font-black border border-amber-200/90 shadow-2xs">
          <MaterialIcon name="two_wheeler" size={15} className="text-amber-700" />
          <span>Out For Delivery</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 rounded-full text-xs font-black border border-emerald-200/80 shadow-2xs">
        <MaterialIcon name="schedule" size={15} className="text-emerald-700" />
        <span>{status}</span>
      </span>
    );
  };

  // Copy order ID helper
  const handleCopyOrderId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => {
      setCopiedOrderId(null);
    }, 2000);
  };

  // One-click Reorder helper
  const handleReorder = (order) => {
    const itemsList = Object.values(order.items || {});
    let addedCount = 0;
    itemsList.forEach((item) => {
      const prodId = item.id || item.productId || item.key;
      if (prodId) {
        addToCart({
          id: prodId,
          name: item.itemName || item.name,
          itemName: item.itemName || item.name,
          price: item.price,
          image: item.image,
          unit: item.unit
        });
        addedCount++;
      }
    });

    setToastMessage(`Added ${addedCount || itemsList.length} items to your cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Dedicated single-order Print Invoice helper
  const handlePrintInvoice = (order) => {
    if (!order) return;

    // Create an isolated invisible iframe to prevent printing the background page / navbar
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const items = Object.values(order.items || {});
    const orderTotal = order.total || items.reduce(
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
      : new Date().toLocaleDateString('en-IN');

    const customerName = order.shippingDetails?.fullName || activeUser?.name || 'Valued Customer';
    const customerPhone = order.shippingDetails?.phone || activeUser?.mobile || '';
    const addressStr = order.deliveryAddress || `${order.shippingDetails?.address || ''}, ${order.shippingDetails?.pincode || ''}`;
    const paymentMethod = order.paymentMethod || order.shippingDetails?.paymentMethod || 'Cash On Delivery';
    const orderId = String(order.id || '').substring(0, 8).toUpperCase();

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice - #BK-${orderId}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            body {
              color: #0f172a;
              background: #fff;
              padding: 10px;
              font-size: 12px;
              line-height: 1.4;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0D4715;
              padding-bottom: 14px;
              margin-bottom: 16px;
            }
            .brand-name {
              font-size: 22px;
              font-weight: 900;
              color: #0D4715;
              letter-spacing: -0.5px;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748b;
              font-weight: 500;
              margin-top: 2px;
            }
            .invoice-right {
              text-align: right;
            }
            .invoice-title {
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
            .invoice-num {
              font-family: monospace;
              font-size: 12px;
              font-weight: 700;
              color: #0D4715;
              margin-top: 2px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
              margin-bottom: 18px;
            }
            .info-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px 12px;
            }
            .info-label {
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748b;
              margin-bottom: 4px;
            }
            .info-val-main {
              font-size: 12px;
              font-weight: 700;
              color: #0f172a;
            }
            .info-val-sub {
              font-size: 11px;
              color: #475569;
              margin-top: 2px;
            }
            .status-tag {
              display: inline-block;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              background: #dcfce7;
              color: #166534;
              padding: 2px 8px;
              border-radius: 9999px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
            }
            thead th {
              background: #f1f5f9;
              color: #475569;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 8px 10px;
              text-align: left;
              border-top: 1px solid #e2e8f0;
              border-bottom: 1px solid #cbd5e1;
            }
            tbody td {
              padding: 8px 10px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 11px;
              color: #1e293b;
            }
            .text-right {
              text-align: right;
            }
            .totals-container {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 20px;
            }
            .totals-box {
              width: 260px;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              font-size: 11px;
              color: #64748b;
            }
            .total-row.grand {
              border-top: 2px solid #0D4715;
              margin-top: 6px;
              padding-top: 6px;
              font-size: 14px;
              font-weight: 900;
              color: #0D4715;
            }
            .footer-note {
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <div class="brand-name">Buykart</div>
              <div class="brand-sub">Hyperlocal Fresh Groceries & Daily Essentials</div>
            </div>
            <div class="invoice-right">
              <div class="invoice-title">TAX INVOICE / RECEIPT</div>
              <div class="invoice-num">#BK-${orderId}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">Customer & Delivery Details</div>
              <div class="info-val-main">${customerName}</div>
              <div class="info-val-sub">${addressStr}</div>
              ${customerPhone ? `<div class="info-val-sub">Phone: ${customerPhone}</div>` : ''}
              ${order.shippingDetails?.deliveryInstructions ? `<div class="info-val-sub" style="color: #b45309; font-weight: 600;">Note: ${order.shippingDetails.deliveryInstructions}</div>` : ''}
            </div>

            <div class="info-card">
              <div class="info-label">Order Details</div>
              <div class="info-val-sub"><strong>Date:</strong> ${dateStr}</div>
              <div class="info-val-sub"><strong>Payment:</strong> ${paymentMethod}</div>
              <div class="info-val-sub" style="margin-top: 4px;">
                <strong>Status:</strong> <span class="status-tag">${order.status || 'Delivered'}</span>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Item Description</th>
                <th class="text-right" style="width: 80px;">Unit Price</th>
                <th class="text-right" style="width: 60px;">Qty</th>
                <th class="text-right" style="width: 90px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, idx) => `
                <tr>
                  <td style="color: #94a3b8;">${idx + 1}</td>
                  <td>
                    <strong>${item.itemName || item.name}</strong>
                    ${item.unit ? `<span style="color: #64748b;"> (${item.unit})</span>` : ''}
                  </td>
                  <td class="text-right">₹${Number(item.price || 0).toLocaleString('en-IN')}</td>
                  <td class="text-right">${item.quantity || 1}</td>
                  <td class="text-right"><strong>₹${(Number(item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-container">
            <div class="totals-box">
              <div class="total-row">
                <span>Subtotal:</span>
                <span style="color: #0f172a; font-weight: 600;">₹${Number(orderTotal).toLocaleString('en-IN')}</span>
              </div>
              <div class="total-row">
                <span>Delivery Fee:</span>
                <span style="color: #166534; font-weight: 700;">FREE</span>
              </div>
              <div class="total-row">
                <span>Taxes & GST:</span>
                <span style="color: #0f172a;">Included</span>
              </div>
              <div class="total-row grand">
                <span>Grand Total:</span>
                <span>₹${Number(orderTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div class="footer-note">
            <p>Thank you for shopping with Buykart! | Support: support@buykart.in</p>
            <p style="margin-top: 2px;">This is a computer-generated invoice and requires no physical signature.</p>
          </div>
        </body>
      </html>
    `;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(invoiceHtml);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 250);
  };

  // Counts for filter pills
  const counts = useMemo(() => {
    const active = orders.filter((o) => isOrderActive(o.status)).length;
    const delivered = orders.filter((o) => String(o.status || '').toLowerCase() === 'delivered').length;
    const issues = orders.filter((o) => {
      const s = String(o.status || '').toLowerCase();
      return s === 'cancelled' || s === 'delivery failed';
    }).length;
    return { all: orders.length, active, delivered, issues };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by tab
    if (filterTab === 'active') {
      result = result.filter((o) => isOrderActive(o.status));
    } else if (filterTab === 'delivered') {
      result = result.filter((o) => String(o.status || '').toLowerCase() === 'delivered');
    } else if (filterTab === 'cancelled') {
      result = result.filter((o) => {
        const s = String(o.status || '').toLowerCase();
        return s === 'cancelled' || s === 'delivery failed';
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => {
        const orderIdMatch = String(o.id || '').toLowerCase().includes(q);
        const itemMatch = Object.values(o.items || {}).some((i) =>
          String(i.itemName || i.name || '').toLowerCase().includes(q)
        );
        return orderIdMatch || itemMatch;
      });
    }

    return result;
  }, [orders, filterTab, searchQuery]);

  if (!activeUser) {
    return (
      <div className="min-h-[75vh] bg-slate-50/70 flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md text-center max-w-md space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0D4715] flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
            <MaterialIcon name="account_circle" size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Please Sign In</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Sign in to view your real-time delivery tracking, past grocery orders, and download receipts.
          </p>
          <Link
            to="/account"
            className="inline-block w-full bg-[#0D4715] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#1b5e20] transition shadow-md"
          >
            Go to Customer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Toast Notification for Reorder */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <MaterialIcon name="check_circle" size={20} className="text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <Link
            to="/cart"
            className="text-xs font-black text-emerald-400 hover:text-emerald-300 underline ml-2 cursor-pointer"
          >
            View Cart
          </Link>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-1 cursor-pointer"
          >
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-slate-700 transition">Home</Link>
          <span>/</span>
          <span className="text-slate-700 font-bold">My Orders & Receipts</span>
        </div>

        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#0D4715] to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <MaterialIcon name="receipt_long" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  My Orders
                </h1>
                <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {orders.length} Total
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Track live hyperlocal deliveries, inspect grocery items, and view digital tax receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={fetchUserOrders}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-[#0D4715] bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200/80 hover:bg-emerald-100 active:scale-95 transition cursor-pointer shadow-2xs disabled:opacity-50"
              title="Refresh Orders"
            >
              <MaterialIcon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Syncing...' : 'Sync Orders'}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                filterTab === 'all'
                  ? 'bg-[#0D4715] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Orders ({counts.all})
            </button>

            <button
              onClick={() => setFilterTab('active')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterTab === 'active'
                  ? 'bg-[#0D4715] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Active ({counts.active})</span>
            </button>

            <button
              onClick={() => setFilterTab('delivered')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                filterTab === 'delivered'
                  ? 'bg-[#0D4715] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Delivered ({counts.delivered})
            </button>

            {counts.issues > 0 && (
              <button
                onClick={() => setFilterTab('cancelled')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  filterTab === 'cancelled'
                    ? 'bg-[#0D4715] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Cancelled ({counts.issues})
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <MaterialIcon
              name="search"
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search order ID or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D4715] focus:ring-1 focus:ring-[#0D4715] transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <MaterialIcon name="close" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0D4715] border-t-transparent"></div>
            <p className="text-slate-500 font-bold text-xs">Syncing your orders and live deliveries...</p>
          </div>
        )}

        {/* Empty State: No Orders at all */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center shadow-xs border border-slate-200/80 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0D4715] border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
              <MaterialIcon name="shopping_bag" size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800">No Orders Placed Yet</h2>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Explore fresh fruits, vegetables, dairy and daily essentials from your local Buykart store.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#0D4715] hover:bg-[#1b5e20] text-white font-bold px-7 py-3 rounded-xl transition shadow-md text-xs mt-2"
            >
              Start Shopping Now
            </Link>
          </div>
        )}

        {/* Empty State: Filter/Search matched 0 */}
        {!loading && orders.length > 0 && filteredOrders.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center shadow-xs border border-slate-200/80 space-y-3 max-w-md mx-auto">
            <MaterialIcon name="filter_alt_off" size={36} className="text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-slate-800">No matching orders found</h3>
            <p className="text-xs text-slate-500 font-medium">
              Try adjusting your filter tab or search keyword.
            </p>
            <button
              onClick={() => {
                setFilterTab('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#0D4715] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
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
              const isActive = isOrderActive(order.status);

              // Timeline expansion state: active orders always open, delivered toggleable
              const isTimelineOpen = expandedTimelines[order.id] !== undefined
                ? expandedTimelines[order.id]
                : isActive;

              // Items expansion state: show 3 by default if > 3 items
              const showAllItems = expandedItems[order.id];
              const displayedItems = showAllItems ? itemsList : itemsList.slice(0, 3);
              const hiddenItemsCount = itemsList.length - 3;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  {/* Top Order Information Bar */}
                  <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Order ID, Date & Badge */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                          <span className="text-[11px] font-black text-slate-800 font-mono">
                            #BK-{order.id?.substring(0, 8).toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleCopyOrderId(order.id)}
                            className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            title="Copy full Order ID"
                          >
                            <MaterialIcon
                              name={copiedOrderId === order.id ? 'check' : 'content_copy'}
                              size={13}
                              className={copiedOrderId === order.id ? 'text-emerald-600' : ''}
                            />
                          </button>
                        </div>

                        {getStatusBadge(order.status)}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <MaterialIcon name="calendar_today" size={13} className="text-slate-400" />
                        <span>Placed: {dateStr}</span>
                      </div>
                    </div>

                    {/* Right: Total Amount & Digital Receipt button */}
                    <div className="flex items-center justify-between md:justify-end gap-5">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          Order Total ({itemsList.length} {itemsList.length === 1 ? 'item' : 'items'})
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-[#0D4715]">
                          ₹{Number(orderTotal).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        onClick={() => setReceiptOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
                        title="View Digital Tax Receipt"
                      >
                        <MaterialIcon name="receipt" size={16} className="text-slate-500" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-6">

                    {/* LIVE TRACKING TIMELINE */}
                    {!isFailed && !isCancelled ? (
                      <div>
                        {/* If order is delivered, provide a clean summary header with toggle */}
                        {!isActive && (
                          <div className="flex items-center justify-between bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/70 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                                <MaterialIcon name="task_alt" size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-emerald-950">
                                  Order Delivered Successfully
                                </p>
                                <p className="text-[11px] text-emerald-800/80 font-medium">
                                  All items safely handed over to your doorstep.
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                setExpandedTimelines((prev) => ({
                                  ...prev,
                                  [order.id]: !isTimelineOpen,
                                }))
                              }
                              className="text-xs font-bold text-emerald-900 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isTimelineOpen ? 'Hide Steps' : 'View Tracking Steps'}</span>
                              <MaterialIcon
                                name={isTimelineOpen ? 'expand_less' : 'expand_more'}
                                size={16}
                              />
                            </button>
                          </div>
                        )}

                        {/* Visual Timeline Rail (Rendered if active or toggled open) */}
                        {isTimelineOpen && (
                          <div className="bg-gradient-to-b from-white via-emerald-50/15 to-slate-50/80 p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
                            
                            {/* Top Status Banner & Rider Card */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                              <div className="flex items-start sm:items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-[#0D4715] text-white flex items-center justify-center shrink-0 shadow-sm">
                                  <MaterialIcon
                                    name={ORDER_STAGES[currentStageIdx]?.icon || 'local_shipping'}
                                    size={22}
                                    className="text-white"
                                  />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                                      Live Order Tracking
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-400">
                                      Step {currentStageIdx + 1} of {ORDER_STAGES.length}
                                    </span>
                                  </div>
                                  <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                                    {order.status || 'Order Placed'}
                                  </h4>
                                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {getStageDescription(order.status)}
                                  </p>
                                </div>
                              </div>

                              {/* Assigned Delivery Partner Card */}
                              {order.assignedRiderName ? (
                                <div className="flex items-center justify-between gap-3 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs shrink-0">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                                      <MaterialIcon name="two_wheeler" size={19} />
                                    </div>
                                    <div className="leading-tight">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] uppercase font-black text-amber-700">
                                          Delivery Partner
                                        </span>
                                        <MaterialIcon name="verified" size={12} className="text-emerald-600" />
                                      </div>
                                      <span className="text-xs font-black text-slate-900 block truncate max-w-[130px]">
                                        {order.assignedRiderName}
                                      </span>
                                    </div>
                                  </div>

                                  {order.assignedRiderMobile && (
                                    <a
                                      href={`tel:${order.assignedRiderMobile}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D4715] hover:bg-[#1b5e20] text-white text-xs font-bold transition shadow-xs cursor-pointer ml-1"
                                      title="Call Delivery Partner"
                                    >
                                      <MaterialIcon name="call" size={14} />
                                      <span>Call</span>
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 text-xs font-semibold text-slate-500 shadow-2xs self-start lg:self-auto">
                                  <MaterialIcon name="schedule" size={16} className="text-slate-400" />
                                  <span>{currentStageIdx >= 6 ? 'Delivered by Buykart Team' : 'Partner assigns when packed'}</span>
                                </div>
                              )}
                            </div>

                            {/* Visual Connected Stepper Rail */}
                            <div className="overflow-x-auto pb-2 scrollbar-none">
                              <div className="min-w-[620px] px-6 pt-2 pb-1">
                                <div className="relative flex items-center justify-between">
                                  
                                  {/* Background Track Line */}
                                  <div className="absolute top-[20px] left-7 right-7 h-1.5 bg-slate-200/90 rounded-full z-0">
                                    <div
                                      className="h-full bg-gradient-to-r from-[#0D4715] via-emerald-600 to-teal-500 transition-all duration-700 rounded-full shadow-xs"
                                      style={{
                                        width: `${(currentStageIdx / (ORDER_STAGES.length - 1)) * 100}%`
                                      }}
                                    ></div>
                                  </div>

                                  {/* Stage Milestone Nodes */}
                                  {ORDER_STAGES.map((stage, idx) => {
                                    const isDone = idx < currentStageIdx;
                                    const isCurrent = idx === currentStageIdx;

                                    return (
                                      <div key={stage.key} className="relative z-10 flex flex-col items-center group">
                                        <div
                                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-300 ${
                                            isCurrent
                                              ? 'bg-[#0D4715] text-white ring-4 ring-emerald-200/80 shadow-md scale-110 -translate-y-0.5'
                                              : isDone
                                              ? 'bg-emerald-700 text-white border-2 border-white shadow-xs'
                                              : 'bg-white text-slate-400 border-2 border-slate-200 shadow-2xs'
                                          }`}
                                        >
                                          {isDone ? (
                                            <MaterialIcon name="check" size={18} />
                                          ) : (
                                            <MaterialIcon
                                              name={stage.icon}
                                              size={18}
                                              className={isCurrent ? 'text-white' : 'text-slate-400'}
                                            />
                                          )}
                                        </div>

                                        <span
                                          className={`text-[11px] mt-2.5 text-center font-bold whitespace-nowrap transition-colors ${
                                            isCurrent
                                              ? 'text-[#0D4715] font-black'
                                              : isDone
                                              ? 'text-slate-800'
                                              : 'text-slate-400 font-medium'
                                          }`}
                                        >
                                          {stage.label}
                                        </span>

                                        <span className={`text-[9px] uppercase font-black tracking-wider mt-0.5 ${
                                          isCurrent ? 'text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded' : isDone ? 'text-emerald-700' : 'text-slate-300'
                                        }`}>
                                          {isCurrent ? 'Active' : isDone ? 'Done' : `Step ${idx + 1}`}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Active Stage Live Spotlight Card */}
                            <div className="bg-white/95 rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  currentStageIdx >= 6 ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-50 text-[#0D4715]'
                                }`}>
                                  <MaterialIcon
                                    name={currentStageIdx >= 6 ? 'task_alt' : 'local_shipping'}
                                    size={18}
                                  />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-900">
                                    {getStageDescription(order.status)}
                                  </p>
                                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    {currentStageIdx >= 6
                                      ? 'Thank you for shopping with Buykart!'
                                      : 'Live updates synced with Buykart Local Store & Dispatch Hub'}
                                  </p>
                                </div>
                              </div>

                              {order.shippingDetails?.deliveryInstructions && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 font-bold shrink-0">
                                  <MaterialIcon name="door_front" size={14} className="text-amber-700" />
                                  <span>Drop-off: {order.shippingDetails.deliveryInstructions}</span>
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-3">
                        <MaterialIcon name="error" size={24} className="text-rose-600 shrink-0" filled />
                        <div>
                          <p className="font-bold">Delivery Status: {order.status}</p>
                          {order.failureReason && (
                            <p className="text-rose-700 mt-0.5">Reason: <strong>{order.failureReason}</strong></p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PURCHASED ITEMS LIST */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Purchased Groceries ({itemsList.length})
                        </h4>
                        {hiddenItemsCount > 0 && (
                          <button
                            onClick={() =>
                              setExpandedItems((prev) => ({
                                ...prev,
                                [order.id]: !showAllItems,
                              }))
                            }
                            className="text-xs font-bold text-[#0D4715] hover:underline cursor-pointer"
                          >
                            {showAllItems ? 'Show Less' : `+ View ${hiddenItemsCount} More Items`}
                          </button>
                        )}
                      </div>

                      <div className="divide-y divide-slate-100 bg-slate-50/60 p-3 sm:p-4 rounded-2xl border border-slate-100">
                        {displayedItems.map((item, idx) => (
                          <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={getProductImageUrl(item, 'jpg_300')}
                                alt={item.itemName || item.name}
                                className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-slate-200/80 shadow-2xs"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = DEFAULT_PRODUCT_IMAGE;
                                }}
                              />
                              <div>
                                <p className="font-black text-slate-900 text-xs sm:text-sm">
                                  {item.itemName || item.name}
                                </p>
                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                  ₹{item.price} × {item.quantity} {item.unit || ''}
                                </p>
                              </div>
                            </div>

                            <span className="font-black text-slate-900 text-xs sm:text-sm">
                              ₹{Number(item.price || 0) * (item.quantity || 1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ADDRESS & PAYMENT SUMMARY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Delivery Address Card */}
                      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                            <MaterialIcon name="location_on" size={16} className="text-[#0D4715]" />
                            <span>Delivery Destination</span>
                          </div>
                          {order.shippingDetails?.addressType && (
                            <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200/80">
                              {order.shippingDetails.addressType}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-700 leading-relaxed pl-5">
                          {order.deliveryAddress || `${order.shippingDetails?.address || 'Doorstep Delivery'}, ${order.shippingDetails?.pincode || ''}`}
                        </p>

                        {(order.shippingDetails?.fullName || order.shippingDetails?.phone) && (
                          <p className="text-[11px] text-slate-400 font-medium pl-5">
                            Contact: {order.shippingDetails?.fullName} • {order.shippingDetails?.phone}
                          </p>
                        )}
                      </div>

                      {/* Payment & Charges Card */}
                      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                          <MaterialIcon name="payments" size={16} className="text-[#0D4715]" />
                          <span>Payment Method</span>
                        </div>

                        <div className="pl-5 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">
                              {order.paymentMethod || order.shippingDetails?.paymentMethod || 'Cash On Delivery'}
                            </span>
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] border border-emerald-100">
                              {isOrderActive(order.status) && (order.paymentMethod === 'COD' || order.shippingDetails?.paymentMethod === 'COD') ? 'Due on Handover' : 'Paid'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                            <span>Delivery Fee</span>
                            <span className="text-emerald-700 font-bold">FREE</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* ORDER ACTION FOOTER */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReorder(order)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D4715] hover:bg-[#1b5e20] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                          title="Re-add all items to your cart"
                        >
                          <MaterialIcon name="replay" size={15} />
                          <span>Reorder All Items</span>
                        </button>

                        <button
                          onClick={() => setReceiptOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                        >
                          <MaterialIcon name="receipt" size={15} className="text-slate-600" />
                          <span>View Invoice</span>
                        </button>
                      </div>

                      <a
                        href={`https://wa.me/916383217328?text=${encodeURIComponent(
                          `Hi Buykart, I need assistance with my Order #BK-${order.id?.substring(0, 8).toUpperCase()}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
                      >
                        <MaterialIcon name="support_agent" size={16} />
                        <span>Order Support</span>
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OFFICIAL DIGITAL RECEIPT & INVOICE MODAL */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overscroll-contain">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D4715] text-white flex items-center justify-center shadow-xs">
                  <MaterialIcon name="receipt" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Buykart Tax Invoice</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    #BK-{receiptOrder.id?.substring(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReceiptOrder(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>

            {/* Scrollable Receipt Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 overscroll-contain">
              
              {/* Order & Store Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Store</span>
                  <p className="font-bold text-slate-900 mt-0.5">Buykart Super Store</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Status</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {receiptOrder.createdAt
                      ? new Date(receiptOrder.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                      : 'Today'}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {receiptOrder.status || 'Confirmed'}
                  </span>
                </div>
              </div>

              {/* Delivery To */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400 block">Deliver To</span>
                <p className="font-black text-slate-900">
                  {receiptOrder.shippingDetails?.fullName || activeUser?.name || 'Valued Customer'}
                </p>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {receiptOrder.deliveryAddress || `${receiptOrder.shippingDetails?.address || ''}, ${receiptOrder.shippingDetails?.pincode || ''}`}
                </p>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                  Itemized Bill Breakdown
                </span>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {Object.values(receiptOrder.items || {}).map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{item.itemName || item.name}</p>
                        <p className="text-[11px] text-slate-400">
                          ₹{item.price} × {item.quantity} {item.unit || ''}
                        </p>
                      </div>
                      <span className="font-black text-slate-900">
                        ₹{Number(item.price || 0) * (item.quantity || 1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Math */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">
                    ₹{Number(receiptOrder.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Delivery Partner Fee</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>GST & Applicable Taxes</span>
                  <span className="font-bold text-slate-800">Included</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-[#0D4715]">
                    ₹{Number(receiptOrder.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => handlePrintInvoice(receiptOrder)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <MaterialIcon name="print" size={16} />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setReceiptOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0D4715] hover:bg-[#1b5e20] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyOrders;
