import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  requiresPrescription: boolean;
  sku: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  hasPrescriptionRequiredItems: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from session storage on mount to survive simple tab switches
  useEffect(() => {
    const savedCart = sessionStorage.getItem('jivexa_shopping_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        sessionStorage.removeItem('jivexa_shopping_cart');
      }
    }
  }, []);

  // Save cart changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    sessionStorage.setItem('jivexa_shopping_cart', JSON.stringify(items));
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const existing = cartItems.find((i) => i.id === item.id);
    if (existing) {
      const updated = cartItems.map((i) => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      saveCart(updated);
    } else {
      const updated = [...cartItems, { ...item, quantity: 1 }];
      saveCart(updated);
    }
  };

  const removeFromCart = (itemId: string) => {
    const updated = cartItems.filter((i) => i.id !== itemId);
    saveCart(updated);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const updated = cartItems.map((i) => 
      i.id === itemId ? { ...i, quantity } : i
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasPrescriptionRequiredItems = cartItems.some((item) => item.requiresPrescription);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      hasPrescriptionRequiredItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
