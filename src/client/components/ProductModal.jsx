import React from 'react';
import { X, ShoppingCart, Plus, Minus, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductImageUrl } from '../utils/imageHelper';

const ProductModal = ({ product, onClose }) => {
  const { cart, addToCart, updateQuantity } = useCart();

  if (!product) return null;

  const cartItem = cart[product.id];
  const qty = cartItem ? cartItem.quantity : 0;
  const stock = Number(product.op_stock || 0);
  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock <= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header Image Box */}
        <div className="relative h-64 bg-gray-50 overflow-hidden">
          <img
            src={getProductImageUrl(product)}
            alt={product.itemName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-md backdrop-blur-md transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute top-4 left-4 bg-[#0D4715] text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
            {product.category || 'Grocery'}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">{product.itemName}</h2>
              {product.unit && <span className="text-xs text-gray-400 font-semibold">Unit: {product.unit}</span>}
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-[#0D4715]">₹{product.price}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
            {product.description || 'Fresh quality grocery produce sourced directly for your daily household needs.'}
          </p>

          {/* Stock Info */}
          <div className="flex items-center justify-between text-xs font-bold pt-1">
            <span className="text-gray-500 uppercase tracking-wider">Stock Status</span>
            {isOutOfStock ? (
              <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Only {stock} left in stock
              </span>
            ) : (
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> In Stock ({stock} available)
              </span>
            )}
          </div>

          {/* Cart Buttons */}
          <div className="pt-3 border-t border-gray-100">
            {qty > 0 ? (
              <div className="flex items-center justify-between bg-[#EBF4DD] rounded-2xl p-2 w-full">
                <button
                  onClick={() => updateQuantity(product.id, -1)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-xs text-[#0D4715] hover:bg-gray-100 transition font-bold cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-[#0D4715] text-lg px-4">{qty} in Cart</span>
                <button
                  onClick={() => updateQuantity(product.id, 1)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-xs text-[#0D4715] hover:bg-gray-100 transition font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                disabled={isOutOfStock}
                onClick={() => addToCart(product)}
                className="w-full bg-[#0D4715] hover:bg-[#41644A] text-white font-extrabold py-3.5 px-4 rounded-2xl transition shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
