"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import ConfirmationModal, { ModalType } from "./ConfirmationModal";

interface ModalOptions {
  type?: ModalType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isAlert?: boolean;
}

interface ModalContextType {
  confirm: (options: ModalOptions) => Promise<boolean>;
  alert: (options: Omit<ModalOptions, 'cancelLabel' | 'isAlert'>) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ModalOptions & { onResolve: (val: boolean) => void }>({
    title: "",
    message: "",
    onResolve: () => {},
  });

  const confirm = useCallback((options: ModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig({
        type: "info",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
        ...options,
        isAlert: false,
        onResolve: (val: boolean) => {
          setIsOpen(false);
          resolve(val);
        },
      });
      setIsOpen(true);
    });
  }, []);

  const alert = useCallback((options: Omit<ModalOptions, 'cancelLabel' | 'isAlert'>): Promise<void> => {
    return new Promise((resolve) => {
      setConfig({
        type: "info",
        confirmLabel: "Got it",
        ...options,
        isAlert: true,
        onResolve: () => {
          setIsOpen(false);
          resolve();
        },
      });
      setIsOpen(true);
    });
  }, []);

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}
      <ConfirmationModal
        isOpen={isOpen}
        type={config.type || "info"}
        title={config.title}
        message={config.message}
        confirmLabel={config.confirmLabel}
        cancelLabel={config.cancelLabel}
        isAlert={config.isAlert}
        onConfirm={() => config.onResolve(true)}
        onCancel={() => config.onResolve(false)}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
