"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Shield, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface Document {
  _id: string;
  docType: "aadhaar" | "pan";
  maskedValue: string;
  createdAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
    } catch {
      toast("error", "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaarNumber: aadhaar, panNumber: pan }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast("success", "Documents encrypted and stored securely");
        setModalOpen(false);
        setAadhaar("");
        setPan("");
        fetchDocuments();
      } else {
        toast("error", data.error || "Failed to save documents");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Document Vault</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Your encrypted identity documents
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setModalOpen(true)}
        >
          Add Documents
        </Button>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : documents.length === 0 ? (
        <Card variant="glass" padding="lg" className="text-center">
          <div className="py-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-xs mx-auto">
              Add your Aadhaar and PAN numbers to securely store and share them.
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setModalOpen(true)}
            >
              Add Your First Documents
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
          {documents.map((doc) => (
            <Card key={doc._id} variant="glass" padding="md">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    doc.docType === "aadhaar"
                      ? "bg-[var(--color-accent-muted)]"
                      : "bg-[var(--color-info-muted)]"
                  }`}>
                    <Shield
                      className="w-5 h-5"
                      style={{
                        color: doc.docType === "aadhaar" ? "var(--color-accent)" : "var(--color-info)",
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {doc.docType === "aadhaar" ? "Aadhaar Card" : "PAN Card"}
                    </h3>
                    <p className="text-lg font-mono mt-1 text-[var(--color-text-primary)] tracking-widest">
                      {doc.docType === "aadhaar"
                        ? `XXXX XXXX ${doc.maskedValue}`
                        : doc.maskedValue}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">
                      Added {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="success" dot>Encrypted</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Documents Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Identity Documents" size="md">
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Your documents will be encrypted with AES-256-GCM before storage. Only masked values are accessible.
        </p>
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Aadhaar Number"
            type="text"
            placeholder="12 digit number"
            required
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            hint="Will be stored as XXXX XXXX last4"
          />
          <Input
            label="PAN Number"
            type="text"
            placeholder="10 character alphanumeric (e.g. ABCDE1234F)"
            required
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            hint="Will be stored as ABCDE****F"
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="flex-1"
              icon={<Shield className="w-4 h-4" />}
            >
              Encrypt & Store
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
