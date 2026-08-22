"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle2, XCircle, Clock, Copy, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

type SessionStatus = "pending" | "approved" | "rejected" | "expired";

export default function RequestVerification() {
  const [docType, setDocType] = useState<"aadhaar" | "pan">("aadhaar");
  const [timeLimit, setTimeLimit] = useState(60);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [maskedValue, setMaskedValue] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const generateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setMaskedValue(null);
    setVerifyUrl(null);

    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, timeLimitSeconds: timeLimit }),
      });
      const data = await res.json();

      if (data.sessionId) {
        setSessionId(data.sessionId);
        setStatus("pending");
        setTimeLeft(timeLimit);
      } else {
        toast("error", data.error || "Failed to create session");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const startNew = () => {
    setSessionId(null);
    setStatus(null);
    setTimeLeft(0);
    setMaskedValue(null);
    setVerifyUrl(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  useEffect(() => {
    if (status === "pending" && sessionId) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/session/${sessionId}`);
          if (res.status === 404) {
            setStatus("expired");
            clearInterval(pollingRef.current!);
            return;
          }
          const data = await res.json();
          if (data.status === "approved" || data.status === "rejected") {
            setStatus(data.status);
            if (data.maskedValue) setMaskedValue(data.maskedValue);
            if (data.verifyUrl) setVerifyUrl(data.verifyUrl);
            clearInterval(pollingRef.current!);
          }
        } catch {
          // Polling error, continue
        }
      }, 2000);

      countdownRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setTimeout(() => {
              setStatus((current) => (current === "pending" ? "expired" : current));
            }, 2500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [status, sessionId]);

  const progressPercent = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;

  // Active session view
  if (sessionId) {
    return (
      <div className="max-w-lg space-y-4 animate-scale-in">
        <button
          onClick={startNew}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          ← New Request
        </button>

        {status === "pending" && (
          <Card variant="glass" padding="lg" className="text-center">
            <div className="space-y-6">
              {/* QR Code */}
              <div className="inline-block bg-white p-4 rounded-2xl">
                <QRCodeSVG value={sessionId} size={220} level="H" />
              </div>

              {/* Session ID */}
              <div className="flex items-center justify-center gap-2">
                <code className="text-xs text-[var(--color-text-muted)] font-mono bg-[var(--color-bg-surface)] px-3 py-1.5 rounded-lg">
                  {sessionId.slice(0, 8)}...{sessionId.slice(-8)}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sessionId);
                    toast("success", "Session ID copied");
                  }}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-info-muted)] border border-[rgba(59,130,246,0.2)]">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--color-info)]" />
                <span className="text-sm font-medium text-[var(--color-info)]">
                  Waiting for approval...
                </span>
              </div>

              {/* Countdown */}
              <div>
                <div className="relative w-full h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{
                      width: `${progressPercent}%`,
                      background: progressPercent > 30
                        ? "var(--color-info)"
                        : progressPercent > 10
                        ? "var(--color-warning)"
                        : "var(--color-error)",
                    }}
                  />
                </div>
                <p className="text-2xl font-mono text-[var(--color-text-primary)] mt-3">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </p>
              </div>
            </div>
          </Card>
        )}

        {status === "approved" && (
          <Card variant="glass" padding="lg" className="text-center border-[rgba(16,185,129,0.3)]">
            <div className="space-y-4 py-4 animate-scale-in">
              <CheckCircle2 className="w-16 h-16 text-[var(--color-success)] mx-auto" />
              <h2 className="text-2xl font-bold text-[var(--color-success)]">Verified ✓</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                The document owner approved your request.
              </p>
              <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl border border-[rgba(16,185,129,0.2)]">
                <p className="text-xs text-[var(--color-success)] uppercase tracking-wider font-semibold mb-1">
                  {docType === "aadhaar" ? "Aadhaar" : "PAN"} (Masked)
                </p>
                <p className="text-xl font-mono tracking-widest text-[var(--color-text-primary)]">
                  {maskedValue}
                </p>
              </div>
              {verifyUrl && (
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Verification Token
                </a>
              )}
            </div>
          </Card>
        )}

        {status === "rejected" && (
          <Card variant="glass" padding="lg" className="text-center border-[rgba(239,68,68,0.3)]">
            <div className="space-y-4 py-4 animate-scale-in">
              <XCircle className="w-16 h-16 text-[var(--color-error)] mx-auto" />
              <h2 className="text-2xl font-bold text-[var(--color-error)]">Rejected</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                The document owner declined to share.
              </p>
              <Button variant="secondary" onClick={startNew}>Try Again</Button>
            </div>
          </Card>
        )}

        {status === "expired" && (
          <Card variant="glass" padding="lg" className="text-center">
            <div className="space-y-4 py-4 animate-scale-in">
              <Clock className="w-16 h-16 text-[var(--color-text-muted)] mx-auto" />
              <h2 className="text-2xl font-bold text-[var(--color-text-secondary)]">Expired</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                This request has timed out.
              </p>
              <Button variant="primary" onClick={startNew}>Generate New QR</Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Form view
  return (
    <div className="max-w-lg">
      <Card variant="glass" padding="lg">
        <h2 className="text-lg font-semibold mb-1">Request Document Verification</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Generate a QR code for the document owner to scan and approve.
        </p>

        <form onSubmit={generateQR} className="space-y-6">
          {/* Document Type */}
          <div className="space-y-2">
            <label className="input-label">Document Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(["aadhaar", "pan"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDocType(type)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    docType === type
                      ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)] border-[var(--color-border-accent)]"
                      : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-default)] hover:border-[var(--color-border-accent)]"
                  }`}
                >
                  {type === "aadhaar" ? "Aadhaar" : "PAN"}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit */}
          <div className="space-y-2">
            <label className="input-label">Time Limit</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "30s", val: 30 },
                { label: "1m", val: 60 },
                { label: "3m", val: 180 },
                { label: "5m", val: 300 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setTimeLimit(opt.val)}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    timeLimit === opt.val
                      ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)] border-[var(--color-border-accent)]"
                      : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-default)] hover:border-[var(--color-border-accent)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Generate QR Code
          </Button>
        </form>
      </Card>
    </div>
  );
}
