"use client";

import { useState, useEffect, use } from "react";
import { CheckCircle2, XCircle, Clock, Shield, AlertTriangle, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface VerifyResult {
  valid: boolean;
  docType?: string;
  maskedValue?: string;
  verifiedAt?: string;
  issuedBy?: string;
  tokenId?: string;
  error?: string;
}

export default function PublicVerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/verify/${encodeURIComponent(token)}`);
        const data = await res.json();
        setResult(data);
      } catch {
        setResult({ valid: false, error: "Verification failed" });
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center px-4">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Vault<span className="text-gradient">ID</span>
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-3">
            Token Verification
          </p>
        </div>

        {loading ? (
          <Card variant="glass" padding="lg" className="text-center">
            <div className="py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)] mx-auto mb-4" />
              <p className="text-sm text-[var(--color-text-secondary)]">Verifying token...</p>
            </div>
          </Card>
        ) : result?.valid ? (
          <Card variant="glass" padding="lg" className="border-[rgba(16,185,129,0.3)]">
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[var(--color-success-muted)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[var(--color-success)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-success)] mb-1">Verified ✓</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  This token is valid and authentic.
                </p>
              </div>

              <div className="bg-[var(--color-bg-surface)] rounded-xl p-4 border border-[var(--color-border-default)] text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-muted)]">Document Type</span>
                  <Badge variant="info">
                    {result.docType === "aadhaar" ? "Aadhaar" : "PAN"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-muted)]">Masked Value</span>
                  <span className="text-sm font-mono text-[var(--color-text-primary)] tracking-wider">
                    {result.docType === "aadhaar" ? `XXXX XXXX ${result.maskedValue}` : result.maskedValue}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-muted)]">Verified At</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(result.verifiedAt!).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-muted)]">Token ID</span>
                  <code className="text-xs font-mono text-[var(--color-text-secondary)]">
                    {result.tokenId}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-muted)]">Issued By</span>
                  <span className="text-xs text-[var(--color-accent)]">{result.issuedBy}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
                <Shield className="w-3.5 h-3.5" />
                Cryptographically verified by VaultID
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="glass" padding="lg" className="border-[rgba(239,68,68,0.3)]">
            <div className="text-center space-y-4 py-4">
              {result?.error?.includes("expired") ? (
                <Clock className="w-16 h-16 text-[var(--color-warning)] mx-auto" />
              ) : result?.error?.includes("revoked") ? (
                <AlertTriangle className="w-16 h-16 text-[var(--color-error)] mx-auto" />
              ) : (
                <XCircle className="w-16 h-16 text-[var(--color-error)] mx-auto" />
              )}
              <h2 className="text-xl font-bold text-[var(--color-error)]">
                {result?.error?.includes("expired") ? "Token Expired" :
                 result?.error?.includes("revoked") ? "Token Revoked" :
                 "Verification Failed"}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {result?.error || "This token could not be verified."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
