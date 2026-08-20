import React from 'react';
import { ShoppingCart, Plus, Minus, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductImageUrl } from '../utils/imageHelper';

const ProductCard = ({ product, onCardClick }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart[product.id];
  const qty = cartItem ? cartItem.quantity : 0;
  const stock = Number(product.op_stock || 0);

  return (
    <div className="bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      {/* Image & Category Pill */}
      <div
        onClick={() => onCardClick && onCardClick(product)}
        className="relative h-52 overflow-hidden bg-gray-50 cursor-pointer"
      >
        <img
          src={getProductImageUrl(product)}
          alt={product.itemName}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80';
          }}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#0D4715] shadow-xs">
          {product.category || 'Grocery'}
        </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-gray-900 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-md">
            <Eye className="w-3.5 h-3.5 text-[#0D4715]" /> Quick View
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-grow">
        <div
          onClick={() => onCardClick && onCardClick(product)}
          className="cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-1 flex-1 pr-2 hover:text-[#0D4715] transition" title={product.itemName}>
              {product.itemName}
            </h3>
            <div className="text-right">
              <span className="text-[#0D4715] font-extrabold text-lg">₹{product.price}</span>
              {product.unit && <span className="text-xs text-gray-400 block font-medium">/ {product.unit}</span>}
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px] leading-relaxed">
            {product.description || 'Fresh quality produce sourced directly for your daily household needs.'}
          </p>
        </div>

        {/* Button Controls */}
        <div className="mt-auto pt-3 border-t border-gray-50">
          {qty > 0 ? (
            <div className="flex items-center justify-between bg-[#EBF4DD] rounded-xl p-1.5 w-full">
              <button
                onClick={() => updateQuantity(product.id, -1)}
                className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-xs text-[#0D4715] hover:bg-gray-100 transition font-bold cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-[#0D4715] text-base px-3">{qty}</span>
              <button
                onClick={() => updateQuantity(product.id, 1)}
                className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-xs text-[#0D4715] hover:bg-gray-100 transition font-bold cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              disabled={stock <= 0}
              onClick={() => addToCart(product)}
              className="w-full bg-[#0D4715] hover:bg-[#41644A] text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
