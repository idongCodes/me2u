"use client";

import React, { useState, useEffect } from "react";
import { X, RotateCcw } from "lucide-react";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number; // in milliseconds
}

export default function UndoToast({
  message,
  onUndo,
  onDismiss,
  duration = 60000,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(Math.ceil(duration / 1000));

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const newProgress = (remaining / duration) * 100;
      
      setProgress(newProgress);
      setTimeLeft(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-black/90 backdrop-blur-md text-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{message}</p>
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
              Undo window: {timeLeft}s
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onUndo();
                onDismiss();
              }}
              className="bg-skyblue text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter flex items-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              <RotateCcw size={14} strokeWidth={3} />
              Undo
            </button>
            <button 
              onClick={onDismiss}
              className="p-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-white/10 w-full overflow-hidden">
          <div 
            className="h-full bg-skyblue transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
