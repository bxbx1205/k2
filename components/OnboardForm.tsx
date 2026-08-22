"use client";

import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";

export default function OnboardForm({ onSuccess }: { onSuccess: (userId: string) => void }) {
  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [loading, setLoading] = useState(false);

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
        onSuccess(data.userId);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving documents");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Setup Profile</h2>
        <p className="text-gray-500 text-sm mb-6">Enter details to store securely.</p>
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
