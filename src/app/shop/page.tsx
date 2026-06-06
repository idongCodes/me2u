"use client";

import Image from "next/image";
import { useCart } from "@/components/CartProvider";

export default function ShopPage() {
  const { addItem } = useCart();

  return (
    <main className="flex-1 flex flex-col p-6 items-center">
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 mt-8">
        
        {/* Hero Section */}
        <div className="w-full relative flex flex-col items-center text-center space-y-4">
          <div className="relative w-48 h-48 mb-2">
            <Image 
              src="/undraw_online-shopping_po8w.svg" 
              alt="Online Shopping Hero" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Shop <span className="text-skyblue">FM2U</span></h1>
            <p className="text-black/70 max-w-sm mx-auto">
              See what is available, add to cart to reserve or view total.
            </p>
            <p className="text-xs text-red-500 font-medium max-w-sm mx-auto">
              In an attempt to prevent scammers we do not accept any form of online payments, everything is cash only!
            </p>
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="w-full mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          
          {/* Hardcoded Shop Item */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Image Carousel (Snap Scrolling) */}
            <div 
              className="relative w-full aspect-square flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="w-full flex-shrink-0 snap-center relative bg-gray-50 flex items-center justify-center p-2">
                <Image src="/shopping.svg" alt="Item photo 1" fill className="object-contain p-2" />
                <span className="absolute top-1 right-1 bg-black/50 text-white text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">1/3</span>
              </div>
              <div className="w-full flex-shrink-0 snap-center relative bg-gray-50 flex items-center justify-center p-2">
                <Image src="/phone-hero.svg" alt="Item photo 2" fill className="object-contain p-2" />
                <span className="absolute top-1 right-1 bg-black/50 text-white text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">2/3</span>
              </div>
              <div className="w-full flex-shrink-0 snap-center relative bg-gray-50 flex items-center justify-center p-2">
                <Image src="/window.svg" alt="Item photo 3" fill className="object-contain p-2" />
                <span className="absolute top-1 right-1 bg-black/50 text-white text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">3/3</span>
              </div>
            </div>
            
            {/* Item Details */}
            <div className="p-3 flex flex-col flex-1 gap-1">
              <div className="flex justify-between items-start gap-1">
                <h3 className="font-semibold text-sm text-gray-900 leading-tight">Vintage Denim Jacket</h3>
                <span className="font-bold text-skyblue text-sm whitespace-nowrap">$25</span>
              </div>
              
              <p className="text-[10px] text-gray-600 line-clamp-2 leading-snug">
                Lightly used denim jacket, perfect for fall. No tears or stains. Size Medium. Freshly washed and ready for a new home.
              </p>
              
              <div className="mt-auto pt-2">
                <button 
                  onClick={() => addItem({ id: '1', name: 'Vintage Denim Jacket', price: 25 })}
                  className="w-full flex items-center justify-center gap-1.5 bg-black text-white py-1.5 rounded-md text-xs font-medium hover:bg-skyblue hover:text-black transition-colors active:scale-95 shadow-sm"
                >
                  {/* Cart with a plus icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1"/>
                    <circle cx="19" cy="21" r="1"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                    <path d="M12 8v6"/>
                    <path d="M9 11h6"/>
                  </svg>
                  Add
                </button>
              </div>
            </div>

          </div>
          
        </div>
        
      </div>
    </main>
  );
}