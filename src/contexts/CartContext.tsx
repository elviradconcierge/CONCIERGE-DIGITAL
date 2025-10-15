/**
 * Cart Context
 *
 * Global cart state management for Dine-In and Shop items
 * Provides cart operations: add, remove, update quantity, clear
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  type: "food" | "product";
  description?: string | null;
  category?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearCartByType: (type: "food" | "product") => void;
  getItemQuantity: (id: string) => number;
  getTotalItems: () => number;
  getTotalItemsByType: (type: "food" | "product") => number;
  getTotalPrice: () => number;
  getTotalPriceByType: (type: "food" | "product") => number;
  isCartEmpty: () => boolean;
  getItemsByType: (type: "food" | "product") => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("hotelCart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("hotelCart", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const clearCartByType = useCallback((type: "food" | "product") => {
    setItems((prev) => prev.filter((item) => item.type !== type));
  }, []);

  const getItemQuantity = useCallback(
    (id: string): number => {
      const item = items.find((i) => i.id === id);
      return item?.quantity || 0;
    },
    [items]
  );

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalItemsByType = useCallback(
    (type: "food" | "product") => {
      return items
        .filter((item) => item.type === type)
        .reduce((total, item) => total + item.quantity, 0);
    },
    [items]
  );

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const getTotalPriceByType = useCallback(
    (type: "food" | "product") => {
      return items
        .filter((item) => item.type === type)
        .reduce((total, item) => total + item.price * item.quantity, 0);
    },
    [items]
  );

  const getItemsByType = useCallback(
    (type: "food" | "product") => {
      return items.filter((item) => item.type === type);
    },
    [items]
  );

  const isCartEmpty = useCallback(() => {
    return items.length === 0;
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearCartByType,
        getItemQuantity,
        getTotalItems,
        getTotalItemsByType,
        getTotalPrice,
        getTotalPriceByType,
        getItemsByType,
        isCartEmpty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
