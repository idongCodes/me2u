"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const { items, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main className="flex-1 flex flex-col p-6 items-center justify-center text-center">
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Your cart is empty</h1>
          <p className="text-black/60">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            href="/shop"
            className="mt-4 w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-skyblue hover:text-black transition-colors active:scale-95 shadow-md flex items-center justify-center"
          >
            Return to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col p-6 items-center">
      <div className="w-full max-w-2xl flex flex-col gap-6 mt-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Your Cart</h1>
          <p className="text-sm text-black/60">Review your items before reserving.</p>
        </div>

        {/* Cart Items List */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-3 flex gap-4 shadow-sm items-center">
              {/* Item Image Placeholder */}
              <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center p-2">
                 <Image src="/shopping.svg" alt={item.name} fill className="object-contain p-2" />
              </div>

              {/* Item Info */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm text-gray-900 leading-tight">{item.name}</h3>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                  </button>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-bold text-skyblue text-sm">${item.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-4 bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-lg mb-4 border-b border-gray-200 pb-2">Order Summary</h3>
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Items ({items.length})</span>
              <span>${totalPrice}</span>
            </div>
            <div className="flex justify-between text-black/60 italic">
              <span>Taxes</span>
              <span>Tax Free</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="font-bold text-gray-900">Total (Cash Only)</span>
            <span className="font-bold text-xl text-skyblue">${totalPrice}</span>
          </div>

          <div className="mt-6 space-y-3">
            <button className="w-full bg-black text-white py-3.5 rounded-lg font-medium hover:bg-skyblue hover:text-black transition-colors active:scale-95 shadow-md">
              Reserve Items
            </button>
            <p className="text-[11px] text-center text-red-500 px-2 font-medium">
              Payment is cash only. Reserving items puts them on hold for you to inspect and purchase in person.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}