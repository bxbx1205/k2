import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import SecuritySection from "@/components/landing/SecuritySection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VaultID — Tokenized Document Verification",
  description:
    "Secure, consent-based identity verification with time-limited tokens. Store encrypted documents, generate verifiable tokens, and share safely via QR codes.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <SecuritySection />
    </>
  );
}
