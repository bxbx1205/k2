import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VaultID — Tokenized Document Verification",
  description:
    "Secure, consent-based identity verification with time-limited tokens. Store encrypted documents, generate verifiable tokens, and share safely via QR codes.",
  keywords: ["KYC", "identity verification", "tokenized", "document sharing", "Aadhaar", "PAN", "QR verification"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
