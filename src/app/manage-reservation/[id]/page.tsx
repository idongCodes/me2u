"use client";

import React, { useState, useEffect } from "react";
import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getReservationForEdit, updateReservation, cancelReservation, getAvailableTimes } from "@/app/actions/reservation";
import { SHOP_ITEMS, ShopItem } from "@/lib/items";
import { CheckCircle2, Loader2, X, Plus, Trash2, Calendar, AlertCircle } from "lucide-react";
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
        <Loader2 className="animate-spin text-skyblue" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[60vh]">
        <AlertCircle size={64} className="text-red-500" />
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-gray-600 max-w-md">{error}</p>
        <Link href="/shop" className="bg-black text-white px-6 py-2 rounded-lg font-medium">
          Return to Shop
        </Link>
      </div>
    );
  }

  if (step === "success-edit" || step === "success-cancel") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[60vh]">
        <CheckCircle2 size={64} className="text-green-500" />
        <h1 className="text-2xl font-bold">
          {step === "success-edit" ? "Reservation Updated!" : "Reservation Cancelled"}
        </h1>
        <p className="text-gray-600 max-w-md">
          {step === "success-edit" 
            ? "Your changes have been saved successfully." 
            : "Your reservation has been cancelled. We hope to see you another time."}
        </p>
        <Link href="/shop" className="bg-black text-white px-6 py-2 rounded-lg font-medium">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col p-6 items-center">
      <div className="w-full max-w-2xl space-y-8 mt-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Manage Your Reservation</h1>
          <p className="text-gray-600 text-sm">
            Hi {reservation.name}, you have a 15-minute window from booking to make changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Date & Time */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-gray-400">
                <Calendar size={16} />
                Date & Time
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">DATE</label>
                  <input 
                    type="date" 
                    value={date} 
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">TIME</label>
                  <select
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    disabled={loadingTimes}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none disabled:bg-gray-100 text-sm font-medium"
                  >
                    <option value="">Select time</option>
                    {availableTimes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleCancel}
              disabled={submitting}
              className="w-full bg-white border-2 border-red-50 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <Trash2 size={16} />
              Cancel Reservation
            </button>
          </div>

          {/* Right Column: Items */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400">Reserved Items</h2>
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {items.length > 0 ? items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{item.name}</span>
                      <span className="text-xs text-skyblue font-bold">${item.price}</span>
                    </div>
                    <button 
                      onClick={() => removeItemFromRes(idx)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )) : (
                  <p className="text-xs text-gray-400 italic py-2 text-center">No items selected.</p>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-sm">Total (Cash)</span>
                <span className="font-bold text-lg text-skyblue">${totalPrice}</span>
              </div>
            </div>

            {/* Add More Items Section */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add More Items</h3>
              <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2">
                {SHOP_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addItemToRes(item)}
                    className="flex items-center gap-3 p-2 bg-white hover:border-skyblue border border-gray-100 rounded-xl transition-all text-left shadow-sm group"
                  >
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex-shrink-0 relative overflow-hidden">
                       <Image src={item.images[0]} alt={item.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold leading-tight group-hover:text-skyblue transition-colors">{item.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold">${item.price}</p>
                    </div>
                    <Plus size={14} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleUpdate}
              disabled={submitting}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-skyblue hover:text-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : "Update Reservation"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
