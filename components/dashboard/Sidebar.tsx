"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  FileText,
  QrCode,
  Key,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Verification", href: "/dashboard/verify", icon: QrCode },
  { label: "Tokens", href: "/dashboard/tokens", icon: Key },
];

interface UserData {
  id: string;
  name: string;
  email: string;
}

export default function Sidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold">
          Vault<span className="text-gradient">ID</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)] border border-[var(--color-border-accent)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-[var(--color-border-default)]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center">
            <User className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {user?.name || "Loading..."}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-muted)] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-[var(--color-bg-surface)] border-r border-[var(--color-border-default)]">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[var(--color-bg-surface)]/90 backdrop-blur-xl border-b border-[var(--color-border-default)] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold">
            Vault<span className="text-gradient">ID</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-default)] animate-slide-in-left">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:pt-0 pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
