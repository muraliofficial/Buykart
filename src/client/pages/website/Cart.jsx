import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft, CheckCircle2, AlertCircle, ShoppingCart, X, MapPin, Phone, CreditCard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getProductImageUrl } from '../../utils/imageHelper';
import CustomerAuthModal from '../../components/website/CustomerAuthModal';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, checkout } = useCart();
  const { customer } = useAuth();
  const activeUser = customer;
  const navigate = useNavigate();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [alertState, setAlertState] = useState(null); // { type: 'success'|'error', message: string }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    phone: '',
    address: '',
    pincode: '',
    paymentMethod: 'COD',
  });

  const items = Object.values(cart);
  const totalPrice = getTotalPrice();

  const handleOpenCheckoutModal = () => {
    if (!activeUser) {
      setAuthModalOpen(true);
      return;
    }
    const defaultAddr = customer?.addresses && customer.addresses.length > 0 ? customer.addresses[0] : '';
    setShippingDetails((prev) => ({
      ...prev,
      fullName: activeUser.name || '',
      phone: activeUser.mobile || activeUser.phone || '',
      address: defaultAddr || prev.address || '',
    }));
    setIsModalOpen(true);
  };

  const handleFinalCheckout = async (e) => {
    e.preventDefault();
    setAlertState(null);

    const cleanPincode = String(shippingDetails.pincode || '').trim();
    if (!/^\d{6}$/.test(cleanPincode)) {
      setAlertState({ type: 'error', message: 'Please enter a valid 6-digit numerical Pincode.' });
      return;
    }

    setCheckoutLoading(true);

    const checkoutPayload = {
      ...shippingDetails,
      pincode: cleanPincode,
      customerId: activeUser?.id,
      customerName: activeUser?.name || shippingDetails.fullName,
      customerMobile: activeUser?.mobile || shippingDetails.phone
    };

    const res = await checkout(checkoutPayload);
    setCheckoutLoading(false);

    if (res.success) {
      setIsModalOpen(false);
      setAlertState({ type: 'success', message: res.message });
      setTimeout(() => navigate('/my-orders'), 1500);
    } else {
      setAlertState({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-[#0D4715]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Your Shopping Cart</h1>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0D4715] hover:text-[#41644A] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Alert Notification Toast */}
        {alertState && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 shadow-md ${
              alertState.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {alertState.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
            )}
            <p className="font-bold text-sm">{alertState.message}</p>
          </div>
        )}

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 space-y-4 max-w-lg mx-auto">
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto" />
            <h2 className="text-xl font-bold text-gray-800">Your Cart is Currently Empty</h2>
            <p className="text-gray-500 text-sm">Looks like you haven't added any fresh groceries to your cart yet.</p>
            <Link
              to="/"
              className="inline-block bg-[#0D4715] hover:bg-[#41644A] text-white font-bold px-6 py-3 rounded-xl transition shadow-md text-sm mt-2"
            >
              Start Shopping Now
            </Link>
          </div>
        ) : (
          /* Cart List & Order Summary Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const itemTotal = Number(item.price || 0) * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:shadow-md"
                  >
                    {/* Thumbnail & Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={getProductImageUrl(item)}
                        alt={item.itemName}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-gray-50 shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80';
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{item.itemName}</h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          ₹{item.price} {item.unit ? `/ ${item.unit}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Modifiers & Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      {/* Plus/Minus Controls */}
                      <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-gray-700 hover:text-[#0D4715] transition font-bold cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-extrabold text-gray-800 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-gray-700 hover:text-[#0D4715] transition font-bold cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right min-w-[70px]">
                        <span className="font-extrabold text-[#0D4715] text-base">₹{itemTotal}</span>
                      </div>

                      {/* Delete Item Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24 space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-800">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-base font-extrabold text-gray-900">Grand Total</span>
                  <span className="text-2xl font-extrabold text-[#0D4715]">₹{totalPrice}</span>
                </div>

                <button
                  onClick={handleOpenCheckoutModal}
                  className="w-full bg-[#0D4715] hover:bg-[#41644A] text-white font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Address & Payment Method Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0D4715]" />
                Delivery Details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFinalCheckout} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.fullName}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0D4715]"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0D4715]"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={shippingDetails.address}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0D4715]"
                  placeholder="Street, Flat No, Landmark..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Pincode</label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.pincode}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0D4715]"
                    placeholder="600001"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Payment Method</label>
                  <select
                    value={shippingDetails.paymentMethod}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, paymentMethod: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0D4715]"
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Card">Credit / Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-400 block">Total Amount</span>
                  <span className="text-xl font-extrabold text-[#0D4715]">₹{totalPrice}</span>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="bg-[#0D4715] hover:bg-[#41644A] text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Place Order Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {authModalOpen && (
        <CustomerAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
            handleOpenCheckoutModal();
          }}
        />
      )}
    </div>
  );
};

export default Cart;
