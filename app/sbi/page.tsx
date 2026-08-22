"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle2, Shield, User, CreditCard, Calendar, MapPin, Search } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type SessionStatus = "pending" | "approved" | "rejected" | "expired";

interface AICreditResult {
  score: number;
  summary: string;
  isMock: boolean;
}

export default function SBIDemoPage() {
  // Traditional Form State
  const [loadingTraditional, setLoadingTraditional] = useState(false);

  // VaultID QR State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [maskedValue, setMaskedValue] = useState<string | null>(null);
  
  // AI Credit State
  const [aiResult, setAiResult] = useState<AICreditResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Generate QR for VaultID on load
  useEffect(() => {
    generateQR();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const generateQR = async () => {
    setStatus(null);
    setMaskedValue(null);
    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: "pan", timeLimitSeconds: 300 }),
      });
      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setStatus("pending");
        setTimeLeft(300); // 5 minutes
      }
    } catch (e) {
      console.error(e);
    }
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
            clearInterval(pollingRef.current!);
            
            // If approved, fetch AI credit score
            if (data.status === "approved") {
              fetchAICredit(data.docType, data.maskedValue);
            }
          }
        } catch {
          // ignore
        }
      }, 2000);

      countdownRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
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

  const handleTraditionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingTraditional(true);
    // Simulate slow processing
    setTimeout(() => {
      setLoadingTraditional(false);
      fetchAICredit("Traditional Forms", "Manually Entered Data");
    }, 3000);
  };

  const fetchAICredit = async (docType: string, maskedVal: string) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/sbi-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, maskedValue: maskedVal }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      {/* Header */}
      <div className="bg-white border-b-4 border-[#0F4A8A]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0F4A8A] flex items-center justify-center">
              <span className="text-white font-bold text-xl">SBI</span>
            </div>
            <span className="text-[#0F4A8A] font-bold text-2xl tracking-tight">State Bank of India</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex flex-col text-right text-xs text-[#0F4A8A]">
              <span>Customer Care: 1800-11-2211</span>
              <span>Toll Free: 1800-425-3800</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blue Navbar */}
      <div className="bg-[#0F4A8A] text-white">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto text-sm">
          {["Services", "Mobile Banking", "FAQ", "Corporate Website", "SBMOPS New", "SB Collect", "Electoral Bond", "Videos", "Apply for SB", "SBI Loans"].map((item) => (
            <div key={item} className="whitespace-nowrap px-4 py-2.5 border-r border-[#1B5C9F] hover:bg-[#155393] cursor-pointer">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-[#FFEDD5] text-[#9A3412] text-center text-sm py-2 border-b border-[#FDBA74]">
        If slowness is observed during Login Page loading, please refresh the page for better experience.
        <br />
        <span className="text-xs text-[#0F4A8A]">SBI never asks for confidential information such as PIN and OTP from customers. Any such call can be made only by a fraudster. Please do not share personal info.</span>
      </div>

      <div className="bg-[#F89C51] text-white text-center text-xs py-1.5 font-medium">
        SBI never asks for your Card/PIN/OTP/CVV details on phone, message or email. Please do not click on links received on your email or mobile asking your Bank details.
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl text-[#0F4A8A] font-light mb-2">Complete Your KYC Verification</h1>
          <p className="text-[#555] text-sm">Choose between the traditional manual process or instantly verify with VaultID.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Panel - Traditional */}
          <div className="flex-1 bg-white border border-[#E0E0E0] shadow-sm">
            <div className="text-center py-6 border-b border-[#E0E0E0] bg-[#F9F9F9]">
              <div className="w-14 h-14 rounded-full border-2 border-[#0F4A8A] text-[#0F4A8A] flex items-center justify-center mx-auto mb-3">
                <User className="w-7 h-7" />
              </div>
              <h2 className="text-[#0F4A8A] text-xl font-medium tracking-wide">TRADITIONAL KYC</h2>
            </div>
            
            <div className="p-6 md:p-8">
              <p className="text-xs text-gray-500 mb-6 italic text-center">
                Manual verification takes 2-3 working days. Please provide accurate details.
              </p>

              <form onSubmit={handleTraditionalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input required type="text" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:border-[#0F4A8A] focus:ring-1 focus:ring-[#0F4A8A] outline-none" placeholder="As per Aadhaar" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Aadhaar Number</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input required type="text" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:border-[#0F4A8A] focus:ring-1 focus:ring-[#0F4A8A] outline-none" placeholder="12 digit number" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PAN Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input required type="text" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:border-[#0F4A8A] focus:ring-1 focus:ring-[#0F4A8A] outline-none" placeholder="10 alphanumeric characters" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input required type="date" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:border-[#0F4A8A] focus:ring-1 focus:ring-[#0F4A8A] outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <textarea required rows={2} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:border-[#0F4A8A] focus:ring-1 focus:ring-[#0F4A8A] outline-none" placeholder="Street, City, PIN Code"></textarea>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <button 
                    type="submit" 
                    disabled={loadingTraditional || aiLoading}
                    className="bg-[#0F4A8A] hover:bg-[#0B3A6F] text-white font-medium px-8 py-2.5 rounded text-sm transition-colors disabled:opacity-70 flex items-center justify-center mx-auto"
                  >
                    {loadingTraditional ? <Loader2 className="w-4 h-4 animate-spin" /> : "SUBMIT & VERIFY"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Panel - VaultID */}
          <div className="flex-1 bg-white border border-[#E0E0E0] shadow-sm">
            <div className="text-center py-6 border-b border-[#E0E0E0] bg-[#F9F9F9]">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-[#0F4A8A] text-xl font-bold">Vault</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-xl font-bold">ID</span>
              </div>
              <h2 className="text-gray-700 text-xl font-medium tracking-wide">INSTANT ZERO-KNOWLEDGE KYC</h2>
            </div>

            <div className="p-6 md:p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
              
              {!sessionId ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">Generating secure connection...</p>
                </div>
              ) : status === "pending" ? (
                <div className="text-center space-y-6 w-full max-w-sm">
                  <p className="text-sm text-gray-600 font-medium">Scan with your VaultID Mobile App</p>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm inline-block mx-auto relative overflow-hidden">
                    {/* Scanning animation effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
                    <QRCodeSVG value={sessionId} size={200} level="H" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-500">Secure Session ID</span>
                    <code className="text-xs bg-gray-100 px-3 py-1 rounded text-gray-600 font-mono">
                      {sessionId.split("-")[0]}...
                    </code>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-xs font-medium text-blue-600">Waiting for PAN approval...</span>
                  </div>
                </div>
              ) : status === "approved" ? (
                <div className="text-center space-y-4 animate-[scale-in_0.3s_ease-out]">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                  <h3 className="text-2xl font-bold text-emerald-600">Verified</h3>
                  <p className="text-sm text-gray-500">Instant verification complete.</p>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mt-4">
                    <p className="text-xs text-emerald-700 font-semibold mb-1 uppercase">Received Verified PAN</p>
                    <p className="text-lg font-mono text-emerald-900 tracking-wider">{maskedValue}</p>
                  </div>
                  <p className="text-xs text-emerald-600/70 mt-2">Zero raw data stored by SBI.</p>
                </div>
              ) : status === "rejected" ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-red-600">User Declined</h3>
                  <p className="text-sm text-gray-500">The user denied the data request.</p>
                  <button onClick={generateQR} className="text-blue-500 text-sm mt-4 hover:underline">Try Again</button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-500">QR Code Expired</p>
                  <button onClick={generateQR} className="text-blue-500 text-sm hover:underline">Generate New QR</button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* AI Credit Score Section */}
        {aiLoading && (
          <div className="mt-8 bg-white border border-[#E0E0E0] shadow-sm p-8 text-center animate-pulse">
            <Search className="w-10 h-10 text-[#0F4A8A] mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-medium text-[#0F4A8A]">Evaluating Profile...</h3>
            <p className="text-sm text-gray-500 mt-2">Connecting to Google Gemini AI to analyze verification data and generate a credit report.</p>
          </div>
        )}

        {aiResult && !aiLoading && (
          <div className="mt-8 bg-gradient-to-r from-[#0F4A8A] to-[#1a5b9f] text-white shadow-lg rounded-t-xl overflow-hidden animate-[slide-up_0.5s_ease-out]">
            <div className="p-8 flex flex-col md:flex-row items-center gap-8">
              {/* Score Circle */}
              <div className="flex-shrink-0 relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                  <circle 
                    cx="64" cy="64" r="56" fill="transparent" 
                    stroke={aiResult.score > 750 ? "#4ADE80" : aiResult.score > 650 ? "#FBBF24" : "#F87171"} 
                    strokeWidth="12" 
                    strokeDasharray={351.8} 
                    strokeDashoffset={351.8 - (351.8 * (aiResult.score / 900))}
                    className="transition-all duration-1500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{aiResult.score}</span>
                  <span className="text-[10px] text-white/70 uppercase">Score</span>
                </div>
              </div>

              {/* Summary text */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h3 className="text-xl font-semibold">Gemini AI Underwriting Report</h3>
                  {aiResult.isMock && <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded text-white font-mono">MOCK MODE</span>}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  {aiResult.summary}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Identity Verified
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Zero-Knowledge Preserved
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    AI Risk: {aiResult.score > 700 ? "LOW" : "MEDIUM"}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black/20 py-2 text-center text-xs text-white/60">
              This is a demonstration generated by Gemini AI. No actual credit checks were performed.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
