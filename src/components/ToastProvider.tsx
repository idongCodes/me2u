"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import UndoToast from "./UndoToast";

interface Toast {
  id: string;
  message: string;
  onUndo: () => void;
}

interface ToastContextType {
  showUndo: (message: string, onUndo: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showUndo = useCallback((message: string, onUndo: () => void) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, onUndo }]);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showUndo }}>
      {children}
      <div className="fixed bottom-0 left-0 right-0 z-[200] pointer-events-none p-6 space-y-4">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto contents">
            <UndoToast
              message={toast.message}
              onUndo={toast.onUndo}
              onDismiss={() => dismiss(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
