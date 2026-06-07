"use client";

import React, { useState, useEffect } from "react";
import { 
  getAllReservations, 
  adminCancelReservation, 
  deleteReservation,
  adminBulkCancelReservations,
  adminBulkDeleteReservations,
  restoreReservation,
  bulkRestoreReservations
} from "@/app/actions/reservation";
import { 
  Loader2, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  ShoppingBag, 
  XCircle, 
  Trash2, 
  CheckCircle2,
  CheckSquare,
  Square,
  MinusSquare
} from "lucide-react";
import { useModal } from "@/components/ModalProvider";
import { useToast } from "@/components/ToastProvider";
import { formatTo12hr } from "@/lib/time";

export default function Reservations() {
  const modal = useModal();
  const toast = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await getAllReservations();
      setReservations(data);
      setSelectedIds([]); // Clear selection on refresh
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
    const confirmed = await modal.confirm({
      type: "warning",
      title: "Cancel Reservation",
      message: "Are you sure you want to cancel this reservation as admin? This will notify the customer via email.",
      confirmLabel: "Yes, Cancel",
      cancelLabel: "No, Keep it"
    });

    if (!confirmed) return;

    setCancellingId(id);
    try {
      const result = await adminCancelReservation(id);
      if (result.success) {
        await fetchReservations();
        modal.alert({
          type: "success",
          title: "Cancelled",
          message: "The reservation has been cancelled successfully."
        });
      } else {
        modal.alert({
          type: "danger",
          title: "Error",
          message: (result as any).error || "Failed to cancel reservation."
        });
      }
    } catch (err) {
      modal.alert({
        type: "danger",
        title: "Error",
        message: "An unexpected error occurred."
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await modal.confirm({
      type: "danger",
      title: "Delete Record",
      message: "Permanently delete this reservation? This cannot be undone and the customer will NOT be notified.",
      confirmLabel: "Delete Forever",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    setDeletingId(id);
    try {
      const result = await deleteReservation(id);
      if (result.success) {
        await fetchReservations();
        toast.showUndo("Reservation record deleted", async () => {
          await restoreReservation(id);
          await fetchReservations();
        });
      } else {
        modal.alert({
          type: "danger",
          title: "Error",
          message: (result as any).error || "Failed to delete reservation."
        });
      }
    } catch (err) {
      modal.alert({
        type: "danger",
        title: "Error",
        message: "An unexpected error occurred."
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === reservations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reservations.map(r => r._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkCancel = async () => {
    const confirmed = await modal.confirm({
      type: "warning",
      title: "Bulk Cancel",
      message: `Are you sure you want to cancel ${selectedIds.length} reservations? This will notify all customers.`,
      confirmLabel: "Yes, Cancel All",
      cancelLabel: "Wait, Go Back"
    });

    if (!confirmed) return;

    setBulkLoading(true);
    try {
      await adminBulkCancelReservations(selectedIds);
      await fetchReservations();
      modal.alert({
        type: "success",
        title: "Success",
        message: `${selectedIds.length} reservations have been cancelled.`
      });
    } catch (err) {
      modal.alert({ type: "danger", title: "Error", message: "Bulk cancellation failed." });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await modal.confirm({
      type: "danger",
      title: "Bulk Delete",
      message: `Are you sure you want to PERMANENTLY delete ${selectedIds.length} reservation records? This cannot be undone.`,
      confirmLabel: "Delete Everything",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    setBulkLoading(true);
    try {
      const idsToRestore = [...selectedIds];
      await adminBulkDeleteReservations(selectedIds);
      await fetchReservations();
      toast.showUndo(`${idsToRestore.length} records deleted`, async () => {
        await bulkRestoreReservations(idsToRestore);
        await fetchReservations();
      });
    } catch (err) {
      modal.alert({ type: "danger", title: "Error", message: "Bulk deletion failed." });
    } finally {
      setBulkLoading(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">All Reservations</h2>
          {reservations.length > 0 && (
            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              {selectedIds.length === reservations.length ? <CheckSquare size={16} className="text-skyblue" /> : selectedIds.length > 0 ? <MinusSquare size={16} className="text-skyblue" /> : <Square size={16} />}
              <span>{selectedIds.length === reservations.length ? "Deselect All" : "Select All"}</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
              <button
                onClick={handleBulkCancel}
                disabled={bulkLoading}
                className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                Cancel ({selectedIds.length})
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Delete ({selectedIds.length})
              </button>
            </div>
          )}
          <button 
            onClick={fetchReservations}
            className="text-xs font-bold text-skyblue uppercase tracking-wider hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {reservations.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
            <p className="text-gray-500">No reservations found.</p>
          </div>
        ) : (
          <>
            {reservations.slice(0, isExpanded ? reservations.length : 3).map((res) => {
              const isSelected = selectedIds.includes(res._id);
              return (
                <div 
                  key={res._id} 
                  onClick={() => toggleSelectOne(res._id)}
                  className={`bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-sm transition-all cursor-pointer relative group ${
                    isSelected ? 'border-skyblue ring-2 ring-skyblue/20' : 'border-gray-200 dark:border-gray-800'
                  } ${res.status === 'cancelled' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                >
                  {/* Selection Indicator */}
                  <div className={`absolute top-6 right-6 transition-all ${isSelected ? 'text-skyblue scale-110' : 'text-gray-200 dark:text-gray-700 group-hover:text-gray-300'}`}>
                    {isSelected ? <CheckCircle2 size={24} /> : <div className="w-6 h-6 border-2 border-current rounded-full" />}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mr-8">
                    {/* Customer Info */}
                    <div className="space-y-3 flex-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <User size={16} className="text-gray-400" />
                        <span className="font-bold text-lg">{res.name}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ml-2 ${
                          res.status === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-300 dark:text-gray-600" />
                          {res.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-300 dark:text-gray-600" />
                          {res.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-300 dark:text-gray-600" />
                          {res.date} at {formatTo12hr(res.time)}
                        </div>
                        <div className="flex items-center gap-2">
                          <ShoppingBag size={14} className="text-gray-300 dark:text-gray-600" />
                          {res.items.length} items - ${res.totalPrice}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Reserved Items</p>
                        <div className="flex flex-wrap gap-2">
                          {res.items.map((item: any, i: number) => (
                            <span key={i} className="text-[11px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg font-bold text-gray-700 dark:text-gray-300">
                              {item.name} (${item.price})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                    {res.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancel(res._id)}
                        disabled={cancellingId === res._id || deletingId === res._id || bulkLoading}
                        className="w-full bg-white dark:bg-gray-800 border-2 border-red-50 dark:border-red-900/20 text-red-500 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2"
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
                      disabled={cancellingId === res._id || deletingId === res._id || bulkLoading}
                      className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-400 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 hover:border-red-50 dark:hover:border-red-900 transition-colors flex items-center justify-center gap-2"
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
                      <p className="text-[9px] text-center text-gray-400 dark:text-gray-500 font-bold uppercase pt-2">
                        ID: {res._id.substring(res._id.length - 8)}
                      </p>
                      <p className="text-[9px] text-center text-gray-400 dark:text-gray-500 font-bold uppercase">
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
              );
            })}

            {reservations.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:border-skyblue hover:text-skyblue transition-all"
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
