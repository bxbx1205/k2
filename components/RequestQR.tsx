"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type SessionStatus = "pending" | "approved" | "rejected" | "expired";

export default function RequestQR({ userId }: { userId: string | null }) {
  const [docType, setDocType] = useState<"aadhaar" | "pan">("aadhaar");
  const [timeLimit, setTimeLimit] = useState(30);
  
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [maskedValue, setMaskedValue] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const generateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setLoading(true);
    setStatus(null);
    setMaskedValue(null);
    
    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, docType, timeLimitSeconds: timeLimit }),
      });
      const data = await res.json();
      
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setStatus("pending");
        setTimeLeft(timeLimit);
      } else {
        alert(data.error || "Failed to generate QR");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating session");
    } finally {
      setLoading(false);
    }
  };

  const startNew = () => {
    setSessionId(null);
    setStatus(null);
    setTimeLeft(0);
    setMaskedValue(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  useEffect(() => {
    if (status === "pending" && sessionId) {
      // Polling
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
            clearInterval(pollingRef.current!);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 2000);

      // Countdown
      countdownRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            // Give polling one last chance before forcing expire UI
            setTimeout(() => {
              setStatus((current) => current === "pending" ? "expired" : current);
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

  if (sessionId) {
    const isPending = status === "pending";
    const isApproved = status === "approved";
    const isRejected = status === "rejected";
    const isExpired = status === "expired";

    return (
      <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <button onClick={startNew} className="text-sm text-gray-500 hover:text-gray-900 transition-colors underline">
          Start New Request
        </button>
        
        <div className={`border rounded-3xl p-8 shadow-sm transition-colors duration-500 text-center ${
          isApproved ? "bg-green-50 border-green-200" :
          isRejected ? "bg-red-50 border-red-200" :
          isExpired ? "bg-gray-100 border-gray-200" :
          "bg-white border-gray-200"
        }`}>
          {isPending && (
            <div className="space-y-6">
              <div className="inline-block bg-white p-4 rounded-2xl shadow-sm border">
                <QRCodeSVG value={sessionId} size={250} level="H" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-mono mt-2 mb-4">Code: {sessionId}</p>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Waiting for approval...
                </div>
                <div className="mt-4 text-2xl font-mono text-gray-700">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          )}

          {isApproved && (
            <div className="space-y-4 py-8 animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-900">Verified ✓</h2>
              <p className="text-green-700">The user has approved your request.</p>
              <div className="mt-6 bg-white p-4 rounded-xl border border-green-100">
                <p className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-1">{docType === 'aadhaar' ? 'Aadhaar' : 'PAN'} (Masked)</p>
                <p className="text-xl font-mono tracking-widest text-green-900">{maskedValue}</p>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="space-y-4 py-8 animate-in zoom-in-50 duration-500">
              <XCircle className="w-20 h-20 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-red-900">Request Rejected</h2>
              <p className="text-red-700">The user declined to share their document.</p>
            </div>
          )}

          {isExpired && (
            <div className="space-y-4 py-8 animate-in zoom-in-50 duration-500 opacity-70">
              <Clock className="w-20 h-20 text-gray-400 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-700">Expired</h2>
              <p className="text-gray-500">This request has timed out.</p>
              <button onClick={startNew} className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">
                Generate new QR
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Request Document</h2>
        <form onSubmit={generateQR} className="space-y-5">
          {!userId && (
            <div className="p-4 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-xl text-sm">
              Please complete the Setup tab first to generate a QR code.
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Document Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDocType("aadhaar")}
                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  docType === "aadhaar" 
                    ? "bg-gray-900 text-white border-gray-900" 
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Aadhaar
              </button>
              <button
                type="button"
                onClick={() => setDocType("pan")}
                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  docType === "pan" 
                    ? "bg-gray-900 text-white border-gray-900" 
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                PAN
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Time Limit</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "30s", val: 30 }, 
                { label: "1m", val: 60 }, 
                { label: "3m", val: 180 }, 
                { label: "5m", val: 300 }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setTimeLimit(opt.val)}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                    timeLimit === opt.val 
                      ? "bg-gray-900 text-white border-gray-900" 
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !userId}
            className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate QR"}
          </button>
        </form>
      </div>
    </div>
  );
}
