"use client";

import { Shield, Clock, UserCheck, Key, QrCode, FileCheck } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "AES-256-GCM Encryption",
    description: "Documents are encrypted with military-grade AES-256-GCM before storage. The encryption key never leaves your server.",
    color: "var(--color-accent)",
    bgColor: "var(--color-accent-muted)",
  },
  {
    icon: Clock,
    title: "Time-Limited Tokens",
    description: "Verification tokens expire automatically. Set 30 seconds to 5 minutes — once expired, the data is permanently inaccessible.",
    color: "var(--color-warning)",
    bgColor: "var(--color-warning-muted)",
  },
  {
    icon: UserCheck,
    title: "Consent-Based Sharing",
    description: "No data is shared without explicit user approval. The document owner must scan and approve every verification request.",
    color: "var(--color-success)",
    bgColor: "var(--color-success-muted)",
  },
  {
    icon: Key,
    title: "Tokenized Verification",
    description: "Generate cryptographic tokens that prove verification without exposing raw data. Independently verifiable by any third party.",
    color: "var(--color-info)",
    bgColor: "var(--color-info-muted)",
  },
  {
    icon: QrCode,
    title: "QR-Code Workflow",
    description: "Seamless verification through QR codes. Generate, scan, approve — all in real-time with instant status updates.",
    color: "#A78BFA",
    bgColor: "rgba(167, 139, 250, 0.15)",
  },
  {
    icon: FileCheck,
    title: "Masked Data Only",
    description: "Only masked document values (last 4 digits of Aadhaar, partial PAN) are ever shared. Full data stays encrypted at rest.",
    color: "#F472B6",
    bgColor: "rgba(244, 114, 182, 0.15)",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-[var(--color-bg-secondary)] relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)] via-transparent to-[var(--color-bg-primary)] opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge badge-neutral mb-4">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for{" "}
            <span className="text-gradient">security-first</span>{" "}
            verification
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
            Every layer is designed to protect your identity while making verification effortless.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card p-6 group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: feature.bgColor }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
              </div>
              <h3 className="text-base font-semibold mb-2 text-[var(--color-text-primary)]">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
