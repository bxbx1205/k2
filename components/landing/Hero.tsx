"use client";

import { ArrowRight, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[var(--color-accent)]/5 blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-[var(--color-success)]/3 blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent-muted)] border border-[var(--color-border-accent)] mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span className="text-xs font-medium text-[var(--color-accent-hover)]">
            Tokenized Identity Verification
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-slide-up">
          Your Identity.{" "}
          <br className="hidden sm:block" />
          Your Control.{" "}
          <br />
          <span className="text-gradient">Verified in Seconds.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Store encrypted documents, generate time-limited verification tokens,
          and share only what&apos;s needed — all with user consent through secure QR codes.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Link href="/signup">
            <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Get Started Free
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="secondary" size="lg">
              See How It Works
            </Button>
          </a>
        </div>

        {/* Trust bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-[var(--color-text-muted)] text-xs animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>AES-256 Encrypted</span>
          </div>
          <div className="w-px h-4 bg-[var(--color-border-default)]" />
          <div className="flex items-center gap-2">
            <span className="status-dot status-dot-active" />
            <span>Zero-Knowledge Masking</span>
          </div>
          <div className="w-px h-4 bg-[var(--color-border-default)]" />
          <div className="flex items-center gap-2">
            <span>🇮🇳</span>
            <span>Aadhaar & PAN Ready</span>
          </div>
        </div>

        {/* Hero visual — Stylized card preview */}
        <div className="mt-20 relative animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="glass-card p-1 max-w-3xl mx-auto glow-accent">
            <div className="bg-[var(--color-bg-card)] rounded-[14px] p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Encrypted doc card */}
                <div className="surface-card p-4 text-left">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5 text-[var(--color-accent)]" />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Aadhaar</p>
                  <p className="text-sm font-mono text-[var(--color-text-primary)]">XXXX XXXX <span className="text-[var(--color-success)]">4832</span></p>
                  <span className="badge badge-success text-[10px] mt-2">Encrypted</span>
                </div>

                {/* Token card */}
                <div className="surface-card p-4 text-left">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-success-muted)] flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-[var(--color-success)]" />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Verification Token</p>
                  <p className="text-sm font-mono text-[var(--color-text-primary)] truncate">vtk_3f8a...9c2d</p>
                  <span className="badge badge-info text-[10px] mt-2">Active · 4:32</span>
                </div>

                {/* QR card */}
                <div className="surface-card p-4 text-left flex flex-col items-start">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-info-muted)] flex items-center justify-center mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-info)]">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="3" height="3" />
                      <rect x="18" y="18" width="3" height="3" />
                    </svg>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">QR Verification</p>
                  <p className="text-sm text-[var(--color-text-primary)]">Scan to verify</p>
                  <span className="badge badge-warning text-[10px] mt-2">Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Glow underneath */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-[var(--color-accent)]/10 blur-[50px] rounded-full" />
        </div>
      </div>
    </section>
  );
}
