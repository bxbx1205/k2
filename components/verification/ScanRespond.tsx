"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, AlertCircle, ScanLine } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

type SessionDetails = {
  docType: "aadhaar" | "pan";
  status: string;
  userId: string;
};

export default function ScanRespond() {
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<"approved" | "rejected" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (session || actionStatus) return;

    const html5QrCode = new Html5Qrcode("qr-reader-new");

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (decodedText) {
            setSessionId(decodedText);
            handleCheckSession(decodedText);
            html5QrCode.stop().catch(console.error);
          }
        },
        () => {}
      )
      .catch((err) => {
        if (err.name === "OverconstrainedError" || err.message?.includes("OverconstrainedError")) {
          html5QrCode
            .start(
              { facingMode: "user" },
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (decodedText) => {
                if (decodedText) {
                  setSessionId(decodedText);
                  handleCheckSession(decodedText);
                  html5QrCode.stop().catch(console.error);
                }
              },
              () => {}
            )
            .catch(console.error);
        }
      });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [session, actionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckSession = async (idToUse = sessionId) => {
    if (!idToUse.trim()) return;
    setLoading(true);
    setError(null);
    setSession(null);
    setActionStatus(null);

    try {
      const res = await fetch(`/api/session/${idToUse}`);
      const data = await res.json();

      if (res.ok) {
        if (data.status !== "pending") {
          setError(`This request is already ${data.status}.`);
        } else {
          setSession(data);
        }
      } else {
        setError(data.error || "Invalid or expired session");
      }
    } catch {
      setError("Error checking session");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/session/${sessionId}/${action}`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionStatus(action === "approve" ? "approved" : "rejected");
        toast(
          action === "approve" ? "success" : "info",
          action === "approve" ? "Document shared successfully" : "Request rejected"
        );
      } else {
        setError(data.error || `Failed to ${action}`);
      }
    } catch {
      setError(`Error during ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSessionId("");
    setSession(null);
    setError(null);
    setActionStatus(null);
    window.location.reload();
  };

  // Result view
  if (actionStatus) {
    return (
      <div className="max-w-lg space-y-4 animate-scale-in">
        <button onClick={reset} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
          ← Scan Another
        </button>
        <Card
          variant="glass"
          padding="lg"
          className={`text-center ${
            actionStatus === "approved"
              ? "border-[rgba(16,185,129,0.3)]"
              : "border-[rgba(239,68,68,0.3)]"
          }`}
        >
          {actionStatus === "approved" ? (
            <div className="space-y-4 py-4">
              <CheckCircle2 className="w-16 h-16 text-[var(--color-success)] mx-auto" />
              <h2 className="text-2xl font-bold text-[var(--color-success)]">Approved</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Masked {session?.docType?.toUpperCase()} has been shared securely.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <XCircle className="w-16 h-16 text-[var(--color-error)] mx-auto" />
              <h2 className="text-2xl font-bold text-[var(--color-error)]">Rejected</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Request declined. No data was shared.
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Consent view
  if (session) {
    return (
      <div className="max-w-lg space-y-4 animate-scale-in">
        <button onClick={reset} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
          ← Cancel
        </button>
        <Card variant="glass" padding="lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-warning-muted)] flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-[var(--color-warning)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Consent Request</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Someone is requesting to verify your{" "}
                <strong className="text-[var(--color-text-primary)] uppercase">{session.docType}</strong>.
                Only the masked value will be shared.
              </p>
            </div>
          </div>

          <div className="bg-[var(--color-bg-surface)] rounded-xl p-4 mb-6 border border-[var(--color-border-default)]">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info">Requested</Badge>
              <span className="text-xs text-[var(--color-text-muted)]">
                {session.docType === "aadhaar" ? "Aadhaar Card" : "PAN Card"}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              ⚠️ Only masked/partial data will be visible to the requester.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => handleAction("reject")}
              loading={loading}
            >
              Reject
            </Button>
            <Button
              variant="success"
              className="flex-1"
              onClick={() => handleAction("approve")}
              loading={loading}
            >
              Approve & Share
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Scanner view
  return (
    <div className="max-w-lg">
      <Card variant="glass" padding="lg">
        <h2 className="text-lg font-semibold mb-1">Scan QR Code</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Point your camera at the verification QR code.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[var(--color-error-muted)] border border-[rgba(239,68,68,0.2)] text-sm text-[var(--color-error)] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Scanner viewport */}
        <div className="relative mb-6 overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          {/* Corner markers */}
          <div className="absolute inset-4 z-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[var(--color-accent)] rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[var(--color-accent)] rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[var(--color-accent)] rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[var(--color-accent)] rounded-br-sm" />
          </div>
          <div
            id="qr-reader-new"
            className="w-full [&>div]:border-none! [&>div>div]:border-none!"
          />
        </div>

        <div className="divider mb-4">or enter manually</div>

        <div className="flex gap-2">
          <Input
            placeholder="Paste session code"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => handleCheckSession()}
            loading={loading}
            disabled={!sessionId.trim()}
          >
            Check
          </Button>
        </div>
      </Card>
    </div>
  );
}
