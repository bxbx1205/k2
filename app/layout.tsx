import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Aadhaar & PAN QR Verify",
  description: "Secure, time-limited document verification demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-white text-gray-900 min-h-screen flex flex-col`}>
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
