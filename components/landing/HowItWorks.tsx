"use client";

import { Upload, QrCode, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Store Encrypted",
    description:
      "Upload your Aadhaar and PAN numbers. They're encrypted with AES-256-GCM and stored securely — only masked values are ever exposed.",
    color: "var(--color-accent)",
    bgColor: "var(--color-accent-muted)",
  },
  {
    number: "02",
    icon: QrCode,
    title: "Generate Token",
    description:
      "Create a time-limited verification token or QR code. Choose the document type, set an expiry, and share the code with the verifier.",
    color: "var(--color-info)",
    bgColor: "var(--color-info-muted)",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Verify Instantly",
    description:
      "The verifier scans the QR or uses the token URL. With your consent, they see only the masked value — never the full document.",
    color: "var(--color-success)",
    bgColor: "var(--color-success-muted)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge badge-info mb-4">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Three steps to{" "}
            <span className="text-gradient">secure verification</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
            A frictionless flow that puts you in control of your identity documents at every step.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 stagger-children">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative group">
              {/* Connector arrow (desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute top-12 -right-4 lg:-right-5 z-10">
                  <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)]" />
                </div>
              )}

              <div className="glass-card p-6 lg:p-8 h-full">
                {/* Step number */}
                <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider">
                  STEP {step.number}
                </span>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mt-4 mb-5 transition-transform group-hover:scale-110"
                  style={{ background: step.bgColor }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-[var(--color-text-primary)]">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
