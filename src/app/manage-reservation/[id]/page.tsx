"use client";

import React, { useState, useEffect } from "react";
import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getReservationForEdit, updateReservation, cancelReservation, getAvailableTimes } from "@/app/actions/reservation";
import { SHOP_ITEMS, ShopItem } from "@/lib/items";
import { CheckCircle2, Loader2, X, Plus, Trash2, Calendar, AlertCircle, ShoppingBag, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManageReservationPage({ params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservation, setReservation] = useState<any>(null);
  const [step, setStep] = useState<"edit" | "success-edit" | "success-cancel">("edit");
  
  // Edit State
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !token) {
      setError("Missing reservation ID or token.");
      setLoading(false);
      return;
    }

    const fetchReservation = async () => {
      try {
        const result = await getReservationForEdit(id, token);
        if (result.success) {
          setReservation(result.reservation);
          setDate(result.reservation.date);
          setTime(result.reservation.time);
          setItems(result.reservation.items);
        } else {
          setError(result.error || "Failed to load reservation.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, token]);

  useEffect(() => {
    if (!date) return;

    const fetchTimes = async () => {
      setLoadingTimes(true);
      try {
        const times = await getAvailableTimes(date, id);
        setAvailableTimes(times);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTimes(false);
      }
    };

    fetchTimes();
  }, [date, id]);

  const totalPrice = items.reduce((acc, item) => acc + item.price, 0);

  const handleUpdate = async () => {
    if (!date || !time || items.length === 0) {
      setError("Please ensure date, time, and at least one item are selected.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await updateReservation(id, token!, {
        date,
        time,
        items,
        totalPrice
      });
      if (result.success) {
        setStep("success-edit");
      } else {
        setError(result.error || "Failed to update reservation.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    setSubmitting(true);
    setError("");
    try {
      const result = await cancelReservation(id, token!);
      if (result.success) {
        setStep("success-cancel");
      } else {
        setError(result.error || "Failed to cancel reservation.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const addItemToRes = (item: ShopItem) => {
    setItems([...items, { id: item.id, name: item.name, price: item.price }]);
  };

  const removeItemFromRes = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
        <Loader2 className="animate-spin text-skyblue" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-red-50 p-6 rounded-full">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">{error}</p>
        </div>
        <Link href="/shop" className="w-full max-w-xs bg-black text-white py-4 rounded-2xl font-bold shadow-md active:scale-95 transition-transform">
          Return to Shop
        </Link>
      </main>
    );
  }

  if (step === "success-edit" || step === "success-cancel") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-green-50 p-6 rounded-full animate-bounce">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold">
            {step === "success-edit" ? "Reservation Updated!" : "Reservation Cancelled"}
          </h1>
          <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            {step === "success-edit" 
              ? "Your changes have been saved successfully. We've updated your booking." 
              : "Your reservation has been cancelled. All items have been released."}
          </p>
        </div>
        <Link href="/shop" className="w-full max-w-xs bg-black text-white py-4 rounded-2xl font-bold shadow-md active:scale-95 transition-transform">
          Return to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-gray-50/50">
      {/* Header Info */}
      <div className="bg-white px-6 pt-8 pb-6 border-b border-gray-100 shadow-sm">
        <div className="w-full max-w-lg mx-auto space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Manage Booking</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full w-fit">
            <Clock size={12} />
            <span>15-MINUTE EDITING WINDOW ACTIVE</span>
          </div>
          <p className="text-gray-500 text-sm font-medium pt-1">
            Hi <span className="text-black font-bold">{reservation.name}</span>, you can modify your reservation details below.
          </p>
        </div>
      </div>

      <div className="w-full max-w-lg mx-auto p-6 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Section: Date & Time */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <Calendar size={12} />
            <span>Schedule</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">Arrival Date</label>
              <input 
                type="date" 
                value={date} 
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-transparent text-base font-bold outline-none border-none p-0 focus:ring-0"
              />
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">Arrival Time</label>
              <select
                value={time}
                onChange={e => setTime(e.target.value)}
                disabled={loadingTimes}
                className="w-full bg-transparent text-base font-bold outline-none border-none p-0 focus:ring-0 appearance-none disabled:opacity-50"
              >
                <option value="">Select a time</option>
                {availableTimes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {loadingTimes && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-skyblue" size={16} />}
            </div>
          </div>
        </div>

        {/* Section: Reserved Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <ShoppingBag size={12} />
              <span>Your Items</span>
            </div>
            <span className="text-xs font-bold text-skyblue">Total: ${totalPrice}</span>
          </div>

          <div className="space-y-2">
            {items.length > 0 ? items.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-gray-50 rounded-xl relative overflow-hidden flex-shrink-0">
                  <Image src={SHOP_ITEMS.find(si => si.id === item.id)?.images[0] || '/shopping.svg'} alt={item.name} fill className="object-contain p-1.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  <p className="text-xs font-bold text-skyblue">${item.price}</p>
                </div>
                <button 
                  onClick={() => removeItemFromRes(idx)}
                  className="p-2 text-gray-300 hover:text-red-500 active:bg-red-50 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            )) : (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
                <p className="text-sm text-gray-400 font-medium italic">No items in reservation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section: Quick Add */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <Plus size={12} />
            <span>Add More Items</span>
          </div>
          
          <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 snap-x [&::-webkit-scrollbar]:hidden">
            {SHOP_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => addItemToRes(item)}
                className="w-32 flex-shrink-0 snap-start bg-white p-3 rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform text-left space-y-2"
              >
                <div className="w-full aspect-square bg-gray-50 rounded-xl relative overflow-hidden">
                   <Image src={item.images[0]} alt={item.name} fill className="object-contain p-2" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold truncate leading-tight">{item.name}</p>
                  <p className="text-[10px] font-black text-skyblue">${item.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 space-y-3 pb-12">
          <button
            onClick={handleUpdate}
            disabled={submitting}
            className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
          </button>
          
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="w-full py-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Cancel Reservation
          </button>
        </div>
      </div>
    </main>
  );
}
