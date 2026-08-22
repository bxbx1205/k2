"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 mesh-gradient">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Vault<span className="text-gradient">ID</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Sign in to access your secure document vault
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--color-error-muted)] border border-[rgba(239,68,68,0.2)] text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock className="w-4 h-4" />}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
              icon={!loading ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              Sign In
            </Button>
          </form>

          <div className="divider mt-6 mb-4">
            <span>New here?</span>
          </div>

          <Link href="/signup">
            <Button variant="secondary" size="md" className="w-full">
              Create an Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
