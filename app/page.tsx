import Link from "next/link";
import { ShieldCheck, QrCode, ScanFace } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <ShieldCheck className="w-8 h-8 text-gray-800" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">QR Verify Demo</h1>
        <p className="text-gray-500">Time-limited document verification</p>
      </div>

      <div className="space-y-4">
        <Link href="/onboard" className="group flex items-center p-4 border rounded-xl hover:border-gray-400 hover:shadow-sm transition-all bg-white">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-gray-100 transition-colors">
            <ShieldCheck className="w-5 h-5 text-gray-700" />
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-gray-900">1. Onboard</h2>
            <p className="text-sm text-gray-500">Store your Aadhaar or PAN securely</p>
          </div>
        </Link>

        <Link href="/request" className="group flex items-center p-4 border rounded-xl hover:border-gray-400 hover:shadow-sm transition-all bg-white">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-gray-100 transition-colors">
            <QrCode className="w-5 h-5 text-gray-700" />
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-gray-900">2. Request</h2>
            <p className="text-sm text-gray-500">Generate a time-limited QR code</p>
          </div>
        </Link>

        <Link href="/scan" className="group flex items-center p-4 border rounded-xl hover:border-gray-400 hover:shadow-sm transition-all bg-white">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-gray-100 transition-colors">
            <ScanFace className="w-5 h-5 text-gray-700" />
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-gray-900">3. Scan</h2>
            <p className="text-sm text-gray-500">Approve or reject verification requests</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
