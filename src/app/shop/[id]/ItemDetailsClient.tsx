"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { getReservedItemIds } from "@/app/actions/reservation";
import { Lock, ShoppingCart, Tag, ArrowLeft, Share2 } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

export default function ItemDetailsClient({ item }: { item: any }) {
  const router = useRouter();
  const modal = useModal();
  const { addItem, items: cartItems } = useCart();
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReserved = async () => {
      try {
        const ids = await getReservedItemIds();
        setReservedIds(ids);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReserved();
  }, []);

  const isReserved = reservedIds.includes(item._id) || item.status === "reserved";
  const isInCart = cartItems.some((i) => i.id === item._id);
  const isUnavailable = isReserved || isInCart;

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${item.name} - $${item.price}`,
      text: item.description,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        modal.alert({
          type: "success",
          title: "Link Copied",
          message: "Item link has been copied to your clipboard.",
        });
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  return (
    <main className="flex-1 flex flex-col p-6 items-center">
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 mt-8">
        <button
          onClick={() => router.push("/shop")}
          className="self-start flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-skyblue transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Shop
        </button>

        <div
          className={`w-full bg-white rounded-3xl border shadow-lg overflow-hidden flex flex-col relative ${
            isReserved ? "opacity-90" : ""
          }`}
        >
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md text-gray-700 hover:text-skyblue hover:bg-white transition-colors border border-gray-200"
            aria-label="Share item"
          >
            <Share2 size={20} />
          </button>

          <div
            className="relative w-full aspect-square flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden bg-gray-50"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {isReserved && (
                <span className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg uppercase tracking-tighter">
                  <Lock size={12} strokeWidth={3} />
                  Reserved
                </span>
              )}
              {isInCart && !isReserved && (
                <span className="bg-skyblue text-black text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg uppercase tracking-tighter">
                  <ShoppingCart size={12} strokeWidth={3} />
                  In Cart
                </span>
              )}
            </div>

            {item.images.length > 0 ? (
              item.images.map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="w-full flex-shrink-0 snap-center relative flex items-center justify-center p-4"
                >
                  <Image
                    src={img}
                    alt={`${item.name} photo ${idx + 1}`}
                    fill
                    className="object-contain p-4"
                    priority={idx === 0}
                  />
                  <span className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {idx + 1} / {item.images.length}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full flex-shrink-0 snap-center relative flex items-center justify-center p-4">
                <Tag size={64} className="text-gray-200" />
              </div>
            )}
          </div>

          <div className="p-8 flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <h1 className="font-extrabold text-3xl text-gray-900 leading-tight">
                {item.name}
              </h1>
              <span className="font-black text-skyblue text-3xl whitespace-nowrap">
                ${item.price}
              </span>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed">
              {item.description}
            </p>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  const isAlreadyInCart = cartItems.some(
                    (i) => i.id === item._id
                  );
                  if (isAlreadyInCart) {
                    modal.alert({
                      type: "warning",
                      title: "Already in Cart",
                      message: `${item.name} is already in your cart.`,
                    });
                    return;
                  }

                  addItem({
                    id: item._id,
                    name: item.name,
                    price: item.price,
                    image: item.images?.[0],
                  });
                  modal.alert({
                    type: "success",
                    title: "Added to Cart",
                    message: `${item.name} has been added to your cart.`,
                  });
                }}
                disabled={isUnavailable || loading}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm border-2 ${
                  isReserved
                    ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                    : isInCart
                    ? "bg-skyblue/10 text-skyblue border-skyblue/20 cursor-default"
                    : "bg-black text-white border-black hover:bg-skyblue hover:text-black hover:border-skyblue"
                }`}
              >
                {isReserved ? (
                  <>
                    <Lock size={20} />
                    Unavailable
                  </>
                ) : isInCart ? (
                  <>
                    <ShoppingCart size={20} />
                    In Cart
                  </>
                ) : (
                  <>
                    <Tag size={20} />
                    Reserve Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
