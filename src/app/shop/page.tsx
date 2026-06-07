"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { getReservedItemIds } from "@/app/actions/reservation";
import { getAvailableShopItems as getLiveItems } from "@/app/actions/shop-items";
import { Lock, ShoppingCart, Tag, Loader2, CheckCircle2, Square, CheckSquare, Trash2, Plus, X } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

export default function ShopPage() {
  const modal = useModal();
  const { addItem, items: cartItems } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const availableItems = items.filter(item => 
    !reservedIds.includes(item._id) && 
    item.status !== 'reserved' && 
    !cartItems.some(i => i.id === item._id)
  );

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === availableItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableItems.map(i => i._id));
    }
  };

  const handleBulkAdd = async () => {
    const itemsToAdd = availableItems.filter(i => selectedIds.includes(i._id));
    
    itemsToAdd.forEach(item => {
      addItem({ 
        id: item._id, 
        name: item.name, 
        price: item.price,
        image: item.images?.[0]
      });
    });

    await modal.alert({
      type: "success",
      title: "Items Added",
      message: `${itemsToAdd.length} items have been added to your cart.`
    });

    setSelectedIds([]);
  };

  const selectedItems = items.filter(i => selectedIds.includes(i._id));
  const selectedTotal = selectedItems.reduce((acc, curr) => acc + curr.price, 0);

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
      <div className="w-full max-w-5xl flex flex-col items-center gap-6 mt-8">
        
        {/* Hero Section */}
        <div className="w-full relative flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
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
          </div>
          
          {/* Select All Toggle */}
          {availableItems.length > 1 && (
            <button 
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-skyblue transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
            >
              {selectedIds.length === availableItems.length ? <CheckSquare size={14} className="text-skyblue" /> : <Square size={14} />}
              <span>{selectedIds.length === availableItems.length ? "Deselect All" : `Select All (${availableItems.length})`}</span>
            </button>
          )}
        </div>

        {/* Shop Items Grid */}
        <div className="w-full mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
          
          {items.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4 opacity-50">
              <Tag size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Shop is empty</p>
            </div>
          ) : (
            items.map((item) => {
              const isReserved = reservedIds.includes(item._id) || item.status === 'reserved';
              const isInCart = cartItems.some(i => i.id === item._id);
              const isSelected = selectedIds.includes(item._id);
              const isUnavailable = isReserved || isInCart;

              return (
                <div 
                  key={item._id} 
                  onClick={() => !isUnavailable && toggleSelection(item._id)}
                  className={`bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col transition-all cursor-pointer relative group ${
                    isSelected ? 'border-skyblue ring-4 ring-skyblue/10 scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
                  } ${isReserved ? 'opacity-75 grayscale-[0.5]' : ''}`}
                >
                  {/* Selection Indicator */}
                  {!isUnavailable && (
                    <div className={`absolute top-4 right-4 z-20 transition-all ${isSelected ? 'text-skyblue scale-110' : 'text-white/80 opacity-0 group-hover:opacity-100'}`}>
                      {isSelected ? <CheckCircle2 size={28} fill="white" /> : <div className="w-7 h-7 border-2 border-current rounded-full bg-black/10 backdrop-blur-sm" />}
                    </div>
                  )}

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
                  <div className="p-5 flex flex-col flex-1 gap-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{item.name}</h3>
                      <span className="font-black text-skyblue text-lg whitespace-nowrap">${item.price}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
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
                              : isSelected
                                ? 'bg-skyblue text-black border-skyblue'
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
                        ) : isSelected ? (
                          <>
                            <CheckCircle2 size={12} />
                            Selected
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

        {/* Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-bottom-8 duration-300">
            <div className="bg-black/90 backdrop-blur-md text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4 border border-white/10">
              <div className="pl-2">
                <p className="text-xs font-black uppercase tracking-widest text-skyblue">
                  {selectedIds.length} {selectedIds.length === 1 ? 'Item' : 'Items'} Selected
                </p>
                <p className="text-xl font-black tracking-tighter">
                  ${selectedTotal}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedIds([])}
                  className="p-3 text-white/50 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={handleBulkAdd}
                  className="bg-skyblue text-black px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter flex items-center gap-2 active:scale-95 transition-all shadow-lg"
                >
                  <Plus size={16} strokeWidth={3} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
