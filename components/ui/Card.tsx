"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "glass" | "surface" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  variant = "surface",
  padding = "md",
  hover = true,
  glow = false,
  className = "",
  onClick,
}: CardProps) {
  const base = variant === "glass" ? "glass-card" : variant === "surface" ? "surface-card" : "";
  const hoverClass = !hover ? "!hover:border-[var(--color-border-default)] !hover:bg-[var(--color-bg-card)] !hover:shadow-none" : "";
  const glowClass = glow ? "glow-accent" : "";
  const clickClass = onClick ? "cursor-pointer" : "";
  const flatStyle = variant === "flat" ? "bg-transparent border-none" : "";

  return (
    <div
      className={`${base} ${flatStyle} ${paddingMap[padding]} ${hoverClass} ${glowClass} ${clickClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
