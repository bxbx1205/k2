"use client";

import { useEffect, useState } from "react";
import { FileText, Key, QrCode, Plus, Scan, ArrowRight, Shield, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface Stats {
  documents: number;
  activeTokens: number;
  verifications: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats>({ documents: 0, activeTokens: 0, verifications: 0 });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);

    // Fetch stats
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (data.documents) {
          setStats((prev) => ({ ...prev, documents: data.documents.length }));
        }
      })
      .catch(console.error);

    fetch("/api/tokens")
      .then((res) => res.json())
      .then((data) => {
        if (data.tokens) {
          const active = data.tokens.filter((t: { status: string }) => t.status === "active").length;
          setStats((prev) => ({
            ...prev,
            activeTokens: active,
            verifications: data.tokens.length,
          }));
        }
      })
      .catch(console.error);
  }, []);

  const statCards = [
    {
      label: "Documents Stored",
      value: stats.documents,
      icon: FileText,
      color: "var(--color-accent)",
      bgColor: "var(--color-accent-muted)",
    },
    {
      label: "Active Tokens",
      value: stats.activeTokens,
      icon: Key,
      color: "var(--color-success)",
      bgColor: "var(--color-success-muted)",
    },
    {
      label: "Total Verifications",
      value: stats.verifications,
      icon: CheckCircle2,
      color: "var(--color-info)",
      bgColor: "var(--color-info-muted)",
    },
  ];

  const quickActions = [
    {
      label: "Add Document",
      description: "Store a new encrypted Aadhaar or PAN",
      icon: Plus,
      href: "/dashboard/documents",
      color: "var(--color-accent)",
      bgColor: "var(--color-accent-muted)",
    },
    {
      label: "Generate Token",
      description: "Create a verifiable sharing token",
      icon: Key,
      href: "/dashboard/tokens",
      color: "var(--color-success)",
      bgColor: "var(--color-success-muted)",
    },
    {
      label: "Scan QR",
      description: "Respond to a verification request",
      icon: Scan,
      href: "/dashboard/verify",
      color: "var(--color-info)",
      bgColor: "var(--color-info-muted)",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          Welcome back, <span className="text-gradient">{user?.name?.split(" ")[0] || "..."}</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Here&apos;s your identity vault overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        {statCards.map((stat) => (
          <Card key={stat.label} variant="glass" padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mono-data">{stat.value}</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: stat.bgColor }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card variant="surface" padding="md" className="group cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: action.bgColor }}
                  >
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                      {action.label}
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Security Status */}
      <Card variant="glass" padding="lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-success-muted)] flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-[var(--color-success)]" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              Vault Security Status
              <Badge variant="success" dot>Secure</Badge>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              All documents are encrypted with AES-256-GCM. Sessions auto-expire via Redis TTL.
              No raw document values are stored or transmitted.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Last checked: just now</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
