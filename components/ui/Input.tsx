"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`input-field ${icon ? "pl-10" : ""} ${error ? "input-error" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--color-error)] mt-1">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
