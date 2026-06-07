"use client";

import React, { useState, useEffect } from "react";
import { 
  getAdminTestimonials, 
  approveTestimonial, 
  deleteTestimonial, 
  restoreTestimonial 
} from "@/app/actions/testimonials";
import { 
  Loader2, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  MessageSquare, 
  User,
  RotateCcw
} from "lucide-react";
import { useModal } from "@/components/ModalProvider";
import { useToast } from "@/components/ToastProvider";

export default function Testimonials() {
  const modal = useModal();
  const toast = useToast();
  
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    try {
      const data = await getAdminTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleApprove = async (id: string) => {
    const confirmed = await modal.confirm({
      type: "info",
      title: "Approve Testimonial",
      message: "This will make the testimonial visible on the home page. Are you sure?",
      confirmLabel: "Approve Now"
    });

    if (!confirmed) return;

    setActionLoading(id);
    try {
      await approveTestimonial(id);
      await fetchTestimonials();
      modal.alert({
        type: "success",
        title: "Approved!",
        message: "The testimonial is now live on your home page."
      });
    } catch (err) {
      alert("Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await modal.confirm({
      type: "danger",
      title: "Delete Testimonial",
      message: `Permanently delete ${name}'s testimonial? This can be undone within 60 seconds.`,
      confirmLabel: "Delete"
    });

    if (!confirmed) return;

    setActionLoading(id);
    try {
      await deleteTestimonial(id);
      await fetchTestimonials();
      toast.showUndo("Testimonial deleted", async () => {
        await restoreTestimonial(id);
        await fetchTestimonials();
      });
    } catch (err) {
      alert("Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && testimonials.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-skyblue" size={32} />
      </div>
    );
  }

  const pending = testimonials.filter(t => t.status === "pending");
  const approved = testimonials.filter(t => t.status === "approved");

  return (
    <div className="space-y-10">
      {/* Pending Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="text-orange-500" size={20} />
          <h2 className="text-xl font-bold">Pending Approval</h2>
          <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full">
            {pending.length}
          </span>
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-gray-500 italic bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
            No new testimonials waiting for review.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pending.map((t) => (
              <TestimonialCard 
                key={t._id} 
                testimonial={t} 
                onApprove={() => handleApprove(t._id)} 
                onDelete={() => handleDelete(t._id, t.name)}
                loading={actionLoading === t._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Approved Section */}
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-green-500" size={20} />
          <h2 className="text-xl font-bold">Approved & Live</h2>
          <span className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full">
            {approved.length}
          </span>
        </div>

        {approved.length === 0 ? (
          <p className="text-sm text-gray-500 italic bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
            You haven't approved any testimonials yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {approved.map((t) => (
              <TestimonialCard 
                key={t._id} 
                testimonial={t} 
                onDelete={() => handleDelete(t._id, t.name)}
                loading={actionLoading === t._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial, onApprove, onDelete, loading }: any) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <span className="font-bold text-gray-900 dark:text-white">{testimonial.name}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
            &quot;{testimonial.content}&quot;
          </p>
          <p className="text-[9px] text-gray-400 font-bold uppercase">
            Submitted: {new Date(testimonial.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex sm:flex-col gap-2 min-w-[120px]">
          {onApprove && (
            <button
              onClick={onApprove}
              className="flex-1 bg-green-500 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} />
              Approve
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex-1 bg-white dark:bg-gray-800 border-2 border-red-50 dark:border-red-900/20 text-red-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
