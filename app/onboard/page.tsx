"use client";

import { useState } from "react";
import { Copy, Check, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function OnboardPage() {
  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, aadhaarNumber: aadhaar, panNumber: pan }),
      });
      const data = await res.json();
      
      if (data.userId) {
        setUserId(data.userId);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving documents");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (userId) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back home
        </Link>
        <div className="bg-white border rounded-2xl p-6 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Documents Saved</h2>
            <p className="text-gray-500 text-sm mt-1">Your Aadhaar and PAN have been securely encrypted.</p>
          </div>
          
          <div className="bg-gray-50 border rounded-xl p-4 mt-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Your User ID</p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-sm bg-white p-2 rounded border text-gray-800 break-all select-all">
                {userId}
              </code>
              <button 
                onClick={copyToClipboard}
                className="p-2 bg-white border rounded hover:bg-gray-50 transition-colors text-gray-700"
                title="Copy User ID"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">Copy this ID to use on the Request screen.</p>
          </div>

          <div className="pt-4">
            <Link 
              href="/request" 
              className="block w-full py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm"
            >
              Go to Request Screen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back home
      </Link>
      
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Onboard</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all bg-gray-50 focus:bg-white"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
            <input 
              required
              type="text" 
              placeholder="12 digit number"
              className="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all bg-gray-50 focus:bg-white"
              value={aadhaar}
              onChange={e => setAadhaar(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">PAN Number</label>
            <input 
              required
              type="text" 
              placeholder="10 character alphanumeric"
              className="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all bg-gray-50 focus:bg-white uppercase"
              value={pan}
              onChange={e => setPan(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure & Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
