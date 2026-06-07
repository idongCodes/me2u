"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { getReservedItemIds } from "@/app/actions/reservation";
import { getAvailableShopItems as getLiveItems } from "@/app/actions/shop-items";
import { Lock, ShoppingCart, Tag, Loader2 } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

export default function ShopPage() {
  const modal = useModal();
  const { addItem, items: cartItems } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [liveItems, ids] = await Promise.all([
        getLiveItems(),
        getReservedItemIds()
      ]);
      setItems(liveItems);
      setReservedIds(ids);
    } catch (err) {
      console.error("Failed to fetch shop data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-skyblue" size={48} />
      </div>
    );
  }

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
        <div className="w-full mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {items.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4 opacity-50">
              <Tag size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Shop is empty</p>
            </div>
          ) : (
            items.map((item) => {
              const isReserved = reservedIds.includes(item._id) || item.status === 'reserved';
              const isInCart = cartItems.some(i => i.id === item._id);
              const isUnavailable = isReserved || isInCart;

              return (
                <div key={item._id} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all ${isReserved ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                  
                  {/* Image Carousel (Snap Scrolling) */}
                  <div 
                    className="relative w-full aspect-square flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {/* Status Badges */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      {isReserved && (
                        <span className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg uppercase tracking-tighter animate-in fade-in zoom-in duration-300">
                          <Lock size={8} strokeWidth={3} />
                          Reserved
                        </span>
                      )}
                      {isInCart && !isReserved && (
                        <span className="bg-skyblue text-black text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg uppercase tracking-tighter animate-in fade-in zoom-in duration-300">
                          <ShoppingCart size={8} strokeWidth={3} />
                          In Cart
                        </span>
                      )}
                    </div>

                    {item.images.length > 0 ? item.images.map((img: string, idx: number) => (
                      <div key={idx} className="w-full flex-shrink-0 snap-center relative bg-gray-50 flex items-center justify-center p-2">
                        <Image src={img} alt={`${item.name} photo ${idx + 1}`} fill className="object-contain p-2" />
                        <span className="absolute top-1 right-1 bg-black/50 text-white text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                          {idx + 1}/{item.images.length}
                        </span>
                      </div>
                    )) : (
                      <div className="w-full flex-shrink-0 snap-center relative bg-gray-50 flex items-center justify-center p-2">
                        <Tag size={32} className="text-gray-200" />
                      </div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="p-3 flex flex-col flex-1 gap-1">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-1">{item.name}</h3>
                      <span className="font-bold text-skyblue text-sm whitespace-nowrap">${item.price}</span>
                    </div>
                    
                    <p className="text-[10px] text-gray-600 line-clamp-2 leading-snug h-[2.4em]">
                      {item.description}
                    </p>
                    
                    <div className="mt-auto pt-2">
                      <button 
                        onClick={() => {
                          const isAlreadyInCart = cartItems.some(i => i.id === item._id);
                          if (isAlreadyInCart) {
                            modal.alert({
                              type: "warning",
                              title: "Already in Cart",
                              message: `${item.name} is already in your cart.`
                            });
                            return;
                          }

                          addItem({ 
                            id: item._id, 
                            name: item.name, 
                            price: item.price,
                            image: item.images?.[0]
                          });
                          modal.alert({
                            type: "success",
                            title: "Added to Cart",
                            message: `${item.name} has been added to your cart.`
                          });
                        }}
                        disabled={isUnavailable}
                        className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm border-2 ${
                          isReserved 
                            ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                            : isInCart
                              ? 'bg-skyblue/10 text-skyblue border-skyblue/20 cursor-default'
                              : 'bg-black text-white border-black hover:bg-skyblue hover:text-black hover:border-skyblue'
                        }`}
                      >
                        {isReserved ? (
                          <>
                            <Lock size={12} />
                            Unavailable
                          </>
                        ) : isInCart ? (
                          <>
                            <ShoppingCart size={12} />
                            In Cart
                          </>
                        ) : (
                          <>
                            <Tag size={12} />
                            Reserve
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
          
        </div>
        
      </div>
    </main>
  );
}
