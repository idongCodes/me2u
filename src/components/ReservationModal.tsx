"use client";

import React, { useState, useEffect } from "react";
import { getAvailableTimes, createReservation } from "@/app/actions/reservation";
import { useCart } from "@/components/CartProvider";
import { X, CheckCircle2, Loader2 } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<"form" | "success">("form");
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [optIn, setOptIn] = useState<"sms" | "email" | "both" | "none">("none");
  
  // Data State
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch available times when date changes
  useEffect(() => {
    if (!date) {
      return;
    }

    const fetchTimes = async () => {
      setLoadingTimes(true);
      setTime(""); // reset selected time
      try {
        const times = await getAvailableTimes(date);
        setAvailableTimes(times);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTimes(false);
      }
    };

    fetchTimes();
  }, [date]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !date || !time) {
      setError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await createReservation({
        name,
        email,
        phone,
        date,
        time,
        optIn,
        items,
        totalPrice,
      });

      if (result.success) {
        setStep("success");
        clearCart();
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOptInChange = (type: "sms" | "email") => {
    if (type === "sms") {
      if (optIn === "email") setOptIn("both");
      else if (optIn === "both") setOptIn("email");
      else if (optIn === "none") setOptIn("sms");
      else if (optIn === "sms") setOptIn("none");
    } else {
      if (optIn === "sms") setOptIn("both");
      else if (optIn === "both") setOptIn("sms");
      else if (optIn === "none") setOptIn("email");
      else if (optIn === "email") setOptIn("none");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="font-bold text-lg">
            {step === "form" ? "Complete Reservation" : "Reservation Confirmed"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {step === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <CheckCircle2 size={64} className="text-green-500" />
              <h3 className="text-xl font-bold">You&apos;re all set!</h3>
              <p className="text-gray-600">
                Your reservation has been confirmed. We&apos;ve sent the details to our team. Please remember payment is <strong>cash only</strong> upon arrival.
              </p>
              <button
                onClick={onClose}
                className="mt-4 w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-skyblue hover:text-black transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="(555) 555-5555"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      required 
                      value={date} 
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => {
                        setDate(e.target.value);
                        if (!e.target.value) {
                          setAvailableTimes([]);
                          setTime("");
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <select
                      required
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      disabled={!date || loadingTimes}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                    >
                      <option value="">{loadingTimes ? "Loading..." : "Select time"}</option>
                      {availableTimes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Notification Preferences</span>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={optIn === "sms" || optIn === "both"}
                        onChange={() => handleOptInChange("sms")}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-600">Receive SMS confirmation</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={optIn === "email" || optIn === "both"}
                        onChange={() => handleOptInChange("email")}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-600">Receive Email confirmation</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Footer / Submit */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-skyblue hover:text-black transition-colors flex items-center justify-center disabled:opacity-70 disabled:hover:bg-black disabled:hover:text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Reservation"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
