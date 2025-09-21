'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product, Cart, CartItem } from '@/types/product';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_TO_CART'; product: Product; quantity: number }
  | { type: 'REMOVE_FROM_CART'; productId: number }
  | { type: 'UPDATE_QUANTITY'; productId: number; quantity: number }
  | { type: 'CLEAR_CART' };

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.product.id === action.product.id);

      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === action.product.id
            ? { ...item, quantity: item.quantity + action.quantity }
            : item
        );
        const total = updatedItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);

        return {
          items: updatedItems,
          total,
          item_count: updatedItems.reduce((count, item) => count + item.quantity, 0)
        };
      } else {
        const newItem: CartItem = {
          product: action.product,
          quantity: action.quantity
        };
        const updatedItems = [...state.items, newItem];
        const total = updatedItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);

        return {
          items: updatedItems,
          total,
          item_count: updatedItems.reduce((count, item) => count + item.quantity, 0)
        };
      }
    }

    case 'REMOVE_FROM_CART': {
      const updatedItems = state.items.filter(item => item.product.id !== action.productId);
      const total = updatedItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);

      return {
        items: updatedItems,
        total,
        item_count: updatedItems.reduce((count, item) => count + item.quantity, 0)
      };
    }

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', productId: action.productId });
      }

      const updatedItems = state.items.map(item =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      );
      const total = updatedItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);

      return {
        items: updatedItems,
        total,
        item_count: updatedItems.reduce((count, item) => count + item.quantity, 0)
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        item_count: 0
      };

    default:
      return state;
  }
}

const initialCart: Cart = {
  items: [],
  total: 0,
  item_count: 0
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('artesellos_cart');
      if (raw) {
        const parsed = JSON.parse(raw) as Cart;
        // Reemplazar estado inicial vía acciones
        parsed.items.forEach((it) => {
          dispatch({ type: 'ADD_TO_CART', product: it.product, quantity: it.quantity });
        });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('artesellos_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_TO_CART', product, quantity });
  };

  const removeFromCart = (productId: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', productId });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
