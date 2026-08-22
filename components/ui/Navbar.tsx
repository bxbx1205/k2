"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Shield } from "lucide-react";
import Button from "./Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Security", href: "#security" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--color-bg-primary)]/80 backdrop-blur-xl border-b border-[var(--color-border-default)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--color-text-primary)]">
              Vault<span className="text-gradient">ID</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)] animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] py-2 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-[var(--color-border-default)] flex gap-3">
              <Link href="/login" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">Log In</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button variant="primary" size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
