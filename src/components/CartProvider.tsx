"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Link from "next/link";

export interface CartItem {
  id: string;
  name: string;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      // Since each item is unique and there's only one of each,
      // if it's already in the cart, do nothing.
      if (prev.some(i => i.id === newItem.id)) {
        return prev;
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const totalItems = items.length;
  const totalPrice = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, totalItems, totalPrice }}>
      {children}
      
      {/* Floating Cart Icon */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md flex justify-end px-6 z-50 pointer-events-none">
          <Link 
            href="/cart"
            className="pointer-events-auto bg-black text-white p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:bg-skyblue hover:text-black transition-all active:scale-95 flex items-center justify-center animate-in fade-in zoom-in duration-300"
            aria-label="View Cart"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-black">
                {totalItems}
              </span>
            </div>
          </Link>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
