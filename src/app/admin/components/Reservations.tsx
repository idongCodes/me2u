"use client";

import React, { useState, useEffect } from "react";
import { getAllReservations, adminCancelReservation, deleteReservation } from "@/app/actions/reservation";
import { Loader2, Calendar, User, Phone, Mail, ShoppingBag, XCircle, Trash2, CheckCircle2 } from "lucide-react";

export default function Reservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await getAllReservations();
      setReservations(data);
    } catch (err) {
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this reservation as admin? This will notify the customer.")) return;

    setCancellingId(id);
    try {
      const result = await adminCancelReservation(id);
      if (result.success) {
        await fetchReservations();
      } else {
        alert(result.error || "Failed to cancel reservation.");
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this reservation? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const result = await deleteReservation(id);
      if (result.success) {
        await fetchReservations();
      } else {
        alert(result.error || "Failed to delete reservation.");
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && reservations.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-skyblue" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">All Reservations</h2>
        <button 
          onClick={fetchReservations}
          className="text-xs font-bold text-skyblue uppercase tracking-wider hover:underline"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {reservations.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-500">No reservations found.</p>
          </div>
        ) : (
          <>
            {reservations.slice(0, isExpanded ? reservations.length : 3).map((res) => (
              <div 
                key={res._id} 
                className={`bg-white border rounded-2xl p-6 shadow-sm transition-all ${
                  res.status === 'cancelled' ? 'opacity-60 grayscale-[0.5] border-gray-100' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Customer Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-bold text-lg">{res.name}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ml-2 ${
                        res.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-300" />
                        {res.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-300" />
                        {res.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-300" />
                        {res.date} at {res.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={14} className="text-gray-300" />
                        {res.items.length} items - ${res.totalPrice}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reserved Items</p>
                      <div className="flex flex-wrap gap-2">
                        {res.items.map((item: any, i: number) => (
                          <span key={i} className="text-[11px] bg-gray-100 px-2 py-1 rounded-lg font-bold">
                            {item.name} (${item.price})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                  {res.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(res._id)}
                      disabled={cancellingId === res._id || deletingId === res._id}
                      className="w-full bg-white border-2 border-red-50 text-red-500 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {cancellingId === res._id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <>
                          <XCircle size={14} />
                          Cancel Reservation
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(res._id)}
                    disabled={cancellingId === res._id || deletingId === res._id}
                    className="w-full bg-white border-2 border-gray-100 text-gray-400 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-50 hover:text-red-500 hover:border-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {deletingId === res._id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Delete Record
                      </>
                    )}
                  </button>
                    <p className="text-[9px] text-center text-gray-400 font-bold uppercase pt-2">
                      ID: {res._id.substring(res._id.length - 8)}
                    </p>
                    <p className="text-[9px] text-center text-gray-400 font-bold uppercase">
                      Booked: {new Date(res.createdAt).toLocaleString()}
                    </p>
                    {res.editCount > 0 && (
                      <p className="text-[9px] text-center text-orange-500 font-black uppercase">
                        Edits: {res.editCount}/2
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {reservations.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:border-skyblue hover:text-skyblue transition-all"
              >
                {isExpanded ? "Show Fewer Reservations" : `Show All Reservations (${reservations.length})`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
