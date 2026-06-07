"use client";

import React, { useState } from "react";
import { X, Loader2, Heart } from "lucide-react";
import { submitTestimonial } from "@/app/actions/testimonials";
import { useModal } from "@/components/ModalProvider";

interface LeaveTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaveTestimonialModal({ isOpen, onClose }: LeaveTestimonialModalProps) {
  const modal = useModal();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;

    setSubmitting(true);
    try {
      const result = await submitTestimonial({ name, content });
      if (result.success) {
        onClose();
        modal.alert({
          type: "success",
          title: "Thank You!",
          message: "Your testimonial has been submitted for review. Neighbors like you make Me2U special!"
        });
      }
    } catch (err) {
      modal.alert({
        type: "danger",
        title: "Error",
        message: "Something went wrong. Please try again later."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-xl font-black tracking-tighter flex items-center gap-2">
            Leave a Testimonial
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-left">Your Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-skyblue text-sm font-bold"
                placeholder="Jane D."
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-left">Your Message</label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-skyblue text-sm font-medium leading-relaxed"
                placeholder="Tell your neighbors about your experience..."
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-black dark:bg-skyblue text-white dark:text-black shadow-lg hover:shadow-skyblue/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Submit Testimonial"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
