"use client";

import { useState } from "react";
import { QrCode, ScanLine } from "lucide-react";
import RequestVerification from "@/components/verification/RequestVerification";
import ScanRespond from "@/components/verification/ScanRespond";

type Tab = "request" | "scan";

export default function VerifyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("request");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Verification Hub</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Request document verification or respond to incoming requests
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex p-1 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
        <button
          onClick={() => setActiveTab("request")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "request"
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)] border border-[var(--color-border-accent)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <QrCode className="w-4 h-4" />
          Request Verification
        </button>
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "scan"
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)] border border-[var(--color-border-accent)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <ScanLine className="w-4 h-4" />
          Scan & Respond
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-scale-in" key={activeTab}>
        {activeTab === "request" && <RequestVerification />}
        {activeTab === "scan" && <ScanRespond />}
      </div>
    </div>
  );
}
