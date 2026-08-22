"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

type SessionDetails = {
  docType: "aadhaar" | "pan";
  status: string;
  userId: string;
};

export default function Scanner() {
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState<SessionDetails | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<"approved" | "rejected" | null>(null);

  useEffect(() => {
    if (session || actionStatus) return; // Don't start camera if already scanned

    const html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode.start(
      { facingMode: "environment" }, // Forces the back camera on mobile
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (decodedText) {
          setSessionId(decodedText);
          handleCheckSession(decodedText);
          html5QrCode.stop().catch(console.error);
        }
      },
      (err) => {
        // Ignore background scan errors
      }
    ).catch(err => {
      console.error("Camera start error:", err);
      // Fallback for laptops without environment camera
      if (err.name === "OverconstrainedError" || err.message?.includes("OverconstrainedError")) {
        html5QrCode.start(
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
        ).catch(console.error);
      }
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [session, actionStatus]);

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
    } catch (err) {
      console.error(err);
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
      } else {
        setError(data.error || `Failed to ${action}`);
      }
    } catch (err) {
      console.error(err);
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
    window.location.reload(); // Simple reset to reinitialize scanner
  };

  if (actionStatus) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-900 transition-colors underline">
          Scan Another QR
        </button>
        
        <div className={`border rounded-2xl p-8 shadow-sm text-center ${
          actionStatus === "approved" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        }`}>
          {actionStatus === "approved" ? (
            <div className="space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-semibold text-green-900">Approved</h2>
              <p className="text-green-700">You have securely shared your masked {session?.docType.toUpperCase()}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="text-2xl font-semibold text-red-900">Rejected</h2>
              <p className="text-red-700">Request declined. No data was shared.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-300">
        <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-900 transition-colors underline">
          Cancel & Scan Again
        </button>
        
        <div className="bg-white border rounded-2xl p-6 shadow-lg">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Consent Request</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Someone is requesting to verify your <strong className="text-gray-900 uppercase">{session.docType}</strong>. 
            Only the masked value will be shared.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => handleAction("approve")}
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex justify-center items-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Approve & Share"}
            </button>
            <button 
              onClick={() => handleAction("reject")}
              disabled={loading}
              className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex justify-center items-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reject"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Scan QR</h2>
        
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6 overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 relative">
          <div id="qr-reader" className="w-full [&>div]:border-none! [&>div>div]:border-none!"></div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="mt-4 space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Manual Entry (For Testing)</label>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Paste session code"
              className="flex-1 px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all bg-gray-50 focus:bg-white text-sm"
              value={sessionId}
              onChange={e => setSessionId(e.target.value)}
            />
            <button 
              onClick={() => handleCheckSession()}
              disabled={loading || !sessionId.trim()}
              className="px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-70 flex items-center justify-center min-w-[80px]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
