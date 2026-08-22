"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Copy, Trash2, Loader2, ExternalLink, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface Token {
  _id: string;
  tokenId: string;
  docType: "aadhaar" | "pan";
  maskedValue: string;
  status: "active" | "expired" | "revoked";
  createdAt: string;
  expiresAt: string;
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [docType, setDocType] = useState<"aadhaar" | "pan">("aadhaar");
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [generatedResult, setGeneratedResult] = useState<{ token: string; tokenId: string; verifyUrl: string } | null>(null);
  const { toast } = useToast();

  const fetchTokens = async () => {
    try {
      const res = await fetch("/api/tokens");
      const data = await res.json();
      if (data.tokens) setTokens(data.tokens);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const res = await fetch("/api/tokens/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, expiryMinutes }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setGeneratedResult({
          token: data.token,
          tokenId: data.tokenId,
          verifyUrl: data.verifyUrl,
        });
        toast("success", "Verification token generated");
        fetchTokens();
      } else {
        toast("error", data.error || "Failed to generate token");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (tokenId: string) => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/revoke`, { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        toast("success", "Token revoked");
        fetchTokens();
      } else {
        toast("error", data.error || "Failed to revoke");
      }
    } catch {
      toast("error", "Network error");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast("success", `${label} copied to clipboard`);
  };

  const getTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (mins > 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `${mins}m ${secs}s`;
  };

  const badgeVariant = (status: string) => {
    if (status === "active") return "success" as const;
    if (status === "revoked") return "error" as const;
    return "warning" as const;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Verification Tokens</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Generate and manage shareable verification tokens
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => { setModalOpen(true); setGeneratedResult(null); }}
        >
          Generate Token
        </Button>
      </div>

      {/* Token List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : tokens.length === 0 ? (
        <Card variant="glass" padding="lg" className="text-center">
          <div className="py-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tokens yet</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-xs mx-auto">
              Generate verification tokens to share proof of your identity documents.
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => { setModalOpen(true); setGeneratedResult(null); }}
            >
              Generate First Token
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {tokens.map((token) => (
            <Card key={token._id} variant="surface" padding="md">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    token.status === "active" ? "bg-[var(--color-success-muted)]" :
                    token.status === "revoked" ? "bg-[var(--color-error-muted)]" :
                    "bg-[var(--color-bg-elevated)]"
                  }`}>
                    <Key className="w-4 h-4" style={{
                      color: token.status === "active" ? "var(--color-success)" :
                             token.status === "revoked" ? "var(--color-error)" :
                             "var(--color-text-muted)"
                    }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <code className="text-sm font-mono text-[var(--color-text-primary)] truncate">
                        {token.tokenId}
                      </code>
                      <Badge variant={badgeVariant(token.status)} dot>
                        {token.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                      <span>{token.docType === "aadhaar" ? "Aadhaar" : "PAN"}</span>
                      <span>·</span>
                      <span className="font-mono">{token.maskedValue}</span>
                      {token.status === "active" && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeLeft(token.expiresAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {token.status === "active" && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => handleRevoke(token.tokenId)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Token Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={generatedResult ? "Token Generated" : "Generate Verification Token"}
        size="md"
      >
        {generatedResult ? (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[var(--color-success-muted)] border border-[rgba(16,185,129,0.2)] text-sm text-[var(--color-success)]">
              ✓ Token created successfully
            </div>

            <div className="space-y-3">
              <div>
                <label className="input-label">Token ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-[var(--color-bg-surface)] px-3 py-2 rounded-lg text-[var(--color-text-primary)] truncate">
                    {generatedResult.tokenId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedResult.tokenId, "Token ID")}
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="input-label">Verification URL</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-[var(--color-bg-surface)] px-3 py-2 rounded-lg text-[var(--color-text-primary)] truncate">
                    {window.location.origin}{generatedResult.verifyUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}${generatedResult.verifyUrl}`, "Verify URL")}
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <Button variant="secondary" className="w-full" onClick={() => setModalOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-5">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Create a signed, time-limited token that proves your identity verification. Anyone with the URL can verify it.
            </p>

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

            <div className="space-y-2">
              <label className="input-label">Token Validity</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "5m", val: 5 },
                  { label: "30m", val: 30 },
                  { label: "1h", val: 60 },
                  { label: "24h", val: 1440 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setExpiryMinutes(opt.val)}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      expiryMinutes === opt.val
                        ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)] border-[var(--color-border-accent)]"
                        : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-default)] hover:border-[var(--color-border-accent)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={generating} className="flex-1" icon={<Key className="w-4 h-4" />}>
                Generate
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
