"use client";

import React from "react";
import { X, AlertCircle, Trash2, Info, CheckCircle2 } from "lucide-react";

export type ModalType = "danger" | "warning" | "info" | "success";

interface ConfirmationModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isAlert?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  type,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isAlert = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 className="text-red-500" size={32} />;
      case "warning":
        return <AlertCircle className="text-orange-500" size={32} />;
      case "success":
        return <CheckCircle2 className="text-green-500" size={32} />;
      default:
        return <Info className="text-skyblue" size={32} />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "warning":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "success":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-black hover:bg-skyblue hover:text-black text-white";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 flex flex-col items-center text-center space-y-4">
          <div className={`p-4 rounded-full ${
            type === 'danger' ? 'bg-red-50' : 
            type === 'warning' ? 'bg-orange-50' : 
            type === 'success' ? 'bg-green-50' : 
            'bg-blue-50'
          }`}>
            {getIcon()}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-gray-900">{title}</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 flex gap-3">
          {!isAlert && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-md ${getButtonClass()}`}
          >
            {isAlert ? "Got it" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
