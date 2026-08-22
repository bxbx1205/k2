"use client";

import { ShieldCheck, Eye, ServerCrash, Lock } from "lucide-react";
import Link from "next/link";
import Button from "../ui/Button";

const pillars = [
  {
    icon: Lock,
    title: "Encryption at Rest",
    detail: "AES-256-GCM with unique IV per document. Your data is unreadable without the server-side key.",
  },
  {
    icon: Eye,
    title: "Zero Raw Exposure",
    detail: "Full document numbers are never sent to the client. Only pre-masked values leave the server.",
  },
  {
    icon: ServerCrash,
    title: "Auto-Expiry Sessions",
    detail: "Redis TTL ensures sessions self-destruct. No stale data, no cleanup, no leaked tokens.",
  },
  {
    icon: ShieldCheck,
    title: "Revocable Tokens",
    detail: "Generated tokens can be revoked instantly. A Redis revocation set ensures immediate invalidation.",
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-success)]/3 blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <span className="badge badge-success mb-4">Security</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Security isn&apos;t a feature.{" "}
              <span className="text-gradient-green">It&apos;s the foundation.</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              Every architectural decision — from encryption algorithms to session storage — is designed
              to minimize data exposure and maximize user control. Your documents never exist in plaintext
              outside the encryption boundary.
            </p>
            <Link href="/signup">
              <Button variant="success" size="lg">
                Start Securing Your Docs
              </Button>
            </Link>
          </div>

          {/* Right — Pillars grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="glass-card p-5 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--color-success-muted)] flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
                  <pillar.icon className="w-5 h-5 text-[var(--color-success)]" />
                </div>
                <h4 className="text-sm font-semibold mb-1.5 text-[var(--color-text-primary)]">
                  {pillar.title}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {pillar.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
