import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('earlyclaim_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [depositMode, setDepositMode] = useState('deposit_50'); // 'deposit_50' | 'full' | 'deposit_70'
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('earlyclaim_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, selectedSize, selectedColor, quantity = 1) => {
    setCartItems(prev => {
      const size = selectedSize || (product.sizes && product.sizes[0]) || 'Standard';
      const color = selectedColor || (product.colors && product.colors[0]) || 'Default';
      const colorImageIndex = (product.imageColors || []).findIndex(item => String(item || '').trim().toLowerCase() === String(color).trim().toLowerCase());
      const selectedImage = product.images?.[colorImageIndex >= 0 ? colorImageIndex : 0];
      const selectedProduct = { ...product, selectedImage };
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].product = selectedProduct;
        return updated;
      } else {
        return [...prev, { product: selectedProduct, size, color, quantity }];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (index, delta) => {
    setCartItems(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalGHS = cartItems.reduce(
    (sum, item) => sum + (item.product.priceGHS || 0) * item.quantity,
    0
  );

  const totalUSD = cartItems.reduce(
    (sum, item) => sum + (item.product.priceUSD || 0) * item.quantity,
    0
  );

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Pre-order deposit calculations
  const depositMultiplier = depositMode === 'deposit_50' ? 0.50 : depositMode === 'deposit_70' ? 0.70 : 1.0;
  const amountDueGHS = Math.round(totalGHS * depositMultiplier);
  const remainingBalanceGHS = totalGHS - amountDueGHS;

  const amountDueUSD = Math.round(totalUSD * depositMultiplier);
  const remainingBalanceUSD = totalUSD - amountDueUSD;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalGHS,
        totalUSD,
        itemCount,
        depositMode,
        setDepositMode,
        amountDueGHS,
        remainingBalanceGHS,
        amountDueUSD,
        remainingBalanceUSD,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
