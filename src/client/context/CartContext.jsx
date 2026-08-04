import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('buykart_cart');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('buykart_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    if (!product || !product.id) return;
    setCart((prevCart) => {
      const currentQty = prevCart[product.id] ? prevCart[product.id].quantity : 0;
      return {
        ...prevCart,
        [product.id]: {
          ...product,
          quantity: currentQty + 1,
        },
      };
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      const existing = prevCart[productId];
      if (!existing) return prevCart;

      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prevCart };
        delete copy[productId];
        return copy;
      }

      return {
        ...prevCart,
        [productId]: {
          ...existing,
          quantity: newQty,
        },
      };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const copy = { ...prevCart };
      delete copy[productId];
      return copy;
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('buykart_cart');
  };

  const getTotalPrice = () => {
    return Object.values(cart).reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  };

  const checkout = async () => {
    if (Object.keys(cart).length === 0) {
      return { success: false, message: 'Your cart is empty.' };
    }

    if (!currentUser) {
      return { success: false, message: 'Please log in to complete checkout.' };
    }

    try {
      const response = await axios.post('/checkout', {
        cart,
        userId: currentUser.id || currentUser.name,
        userName: currentUser.name,
      });

      clearCart();
      return { success: true, message: response.data.message || 'Order placed successfully!' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Checkout failed. Please try again.';
      return { success: false, message: msg };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
