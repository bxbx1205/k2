"use client";

import { useState } from "react";
import OnboardForm from "@/components/OnboardForm";
import RequestQR from "@/components/RequestQR";
import Scanner from "@/components/Scanner";
import { ShieldCheck, QrCode, ScanFace } from "lucide-react";

type Tab = "setup" | "request" | "scan";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("setup");
  const [userId, setUserId] = useState<string | null>(null);

  const handleSetupSuccess = (newUserId: string) => {
    setUserId(newUserId);
    // Automatically switch to request tab to eliminate friction
    setActiveTab("request");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Tab Navigation */}
      <div className="bg-gray-100 p-1 rounded-2xl flex space-x-1">
        <button
          onClick={() => setActiveTab("setup")}
          className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "setup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4 mr-2" />
          Setup
        </button>
        <button
          onClick={() => setActiveTab("request")}
          className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "request" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Request
        </button>
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "scan" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ScanFace className="w-4 h-4 mr-2" />
          Scan
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "setup" && <OnboardForm onSuccess={handleSetupSuccess} />}
        {activeTab === "request" && <RequestQR userId={userId} />}
        {activeTab === "scan" && <Scanner />}
      </div>
      
    </div>
  );
}
