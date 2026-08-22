"use client";

import { ReactNode } from "react";

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

export default function Badge({
  variant = "neutral",
  children,
  dot = false,
  className = "",
}: BadgeProps) {
  const dotColorMap: Record<BadgeVariant, string> = {
    success: "bg-[var(--color-success)]",
    error: "bg-[var(--color-error)]",
    warning: "bg-[var(--color-warning)]",
    info: "bg-[var(--color-info)]",
    neutral: "bg-[var(--color-text-muted)]",
  };

  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColorMap[variant]}`} />
      )}
      {children}
    </span>
  );
}
