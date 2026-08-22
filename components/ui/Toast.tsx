"use client";

import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const iconMap: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />,
    error: <XCircle className="w-4 h-4 text-[var(--color-error)]" />,
    warning: <AlertCircle className="w-4 h-4 text-[var(--color-warning)]" />,
    info: <Info className="w-4 h-4 text-[var(--color-info)]" />,
  };

  const bgMap: Record<ToastType, string> = {
    success: "border-[rgba(16,185,129,0.2)]",
    error: "border-[rgba(239,68,68,0.2)]",
    warning: "border-[rgba(245,158,11,0.2)]",
    info: "border-[rgba(59,130,246,0.2)]",
  };

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-card)] border ${bgMap[toast.type]} shadow-lg animate-slide-up backdrop-blur-xl`}
    >
      {iconMap[toast.type]}
      <span className="text-sm text-[var(--color-text-primary)] flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[200] space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
