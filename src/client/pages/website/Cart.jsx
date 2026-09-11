import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getProductImageUrl, DEFAULT_PRODUCT_IMAGE } from '../../utils/imageHelper';
import { useToast } from '../../components/common/Toast';
import CustomerAuthModal from '../../components/website/CustomerAuthModal';
import MaterialIcon from '../../components/common/MaterialIcon';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, checkout } = useCart();
  const { customer } = useAuth();
  const activeUser = customer;
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
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

    const cleanPincode = String(shippingDetails.pincode || '').trim();
    if (!/^\d{6}$/.test(cleanPincode)) {
      showError('Please enter a valid 6-digit numerical Pincode.');
      return;
    }

    setCheckoutLoading(true);

    const checkoutPayload = {
      ...shippingDetails,
      pincode: cleanPincode,
      customerId: activeUser?.id,
      customerName: activeUser?.name || shippingDetails.fullName,
      customerMobile: activeUser?.mobile || shippingDetails.phone,
    };

    const res = await checkout(checkoutPayload);
    setCheckoutLoading(false);

    if (res.success) {
      setIsModalOpen(false);
      showSuccess(res.message || 'Order placed successfully! Delivery on its way.');
      setTimeout(() => navigate('/my-orders'), 1500);
    } else {
      showError(res.message || 'Failed to place order.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#0D4715] flex items-center justify-center shadow-xs">
              <MaterialIcon name="shopping_bag" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Shopping Cart</h1>
              <p className="text-xs text-slate-500 font-medium">{items.length} item{items.length === 1 ? '' : 's'} added</p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0D4715] hover:text-emerald-700 transition"
          >
            <MaterialIcon name="arrow_back" size={18} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200/80 space-y-4 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MaterialIcon name="remove_shopping_cart" size={40} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Your Cart is Currently Empty</h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              Looks like you haven't added any fresh groceries or daily essentials to your cart yet.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#0D4715] hover:bg-[#1b5e20] text-white font-bold px-6 py-3 rounded-2xl transition shadow-md text-xs sm:text-sm mt-2"
            >
              <MaterialIcon name="storefront" size={18} />
              <span>Explore Fresh Items</span>
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
                    className="bg-white p-4 sm:p-5 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:shadow-md"
                  >
                    {/* Thumbnail & Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={getProductImageUrl(item)}
                        alt={item.itemName}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl bg-slate-50 shrink-0 border border-slate-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-base truncate">{item.itemName}</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          ₹{item.price} {item.unit ? `/ ${item.unit}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Modifiers & Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      {/* Plus/Minus Controls */}
                      <div className="flex items-center bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-700 hover:text-[#0D4715] transition font-bold cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <MaterialIcon name="remove" size={16} />
                        </button>
                        <span className="w-8 text-center font-black text-slate-800 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-700 hover:text-[#0D4715] transition font-bold cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <MaterialIcon name="add" size={16} />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right min-w-[70px]">
                        <span className="font-black text-[#0D4715] text-base">₹{itemTotal}</span>
                      </div>

                      {/* Delete Item Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <MaterialIcon name="delete_outline" size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 sticky top-24 space-y-6">
                <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <MaterialIcon name="receipt" size={20} className="text-[#0D4715]" />
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Charges</span>
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">FREE</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-base font-black text-slate-900">Grand Total</span>
                  <span className="text-2xl font-black text-[#0D4715]">₹{totalPrice}</span>
                </div>

                <button
                  onClick={handleOpenCheckoutModal}
                  className="w-full bg-[#0D4715] hover:bg-[#1b5e20] text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <MaterialIcon name="shopping_bag" size={18} />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Address & Payment Method Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <MaterialIcon name="local_shipping" size={22} className="text-[#0D4715]" />
                Delivery Details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleFinalCheckout} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.fullName}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0D4715] focus:bg-white"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0D4715] focus:bg-white"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={shippingDetails.address}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0D4715] focus:bg-white"
                  placeholder="Street, Flat No, Landmark..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Pincode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shippingDetails.pincode}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0D4715] focus:bg-white"
                    placeholder="600001"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Payment Method</label>
                  <select
                    value={shippingDetails.paymentMethod}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, paymentMethod: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0D4715] focus:bg-white cursor-pointer"
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Card">Credit / Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold uppercase">Total Payable</span>
                  <span className="text-xl font-black text-[#0D4715]">₹{totalPrice}</span>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="bg-[#0D4715] hover:bg-[#1b5e20] text-white font-extrabold py-3 px-6 rounded-xl transition shadow-md flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {checkoutLoading ? (
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>
                      <MaterialIcon name="check_circle" size={18} />
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
