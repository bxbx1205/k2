import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                Vault<span className="text-gradient">ID</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs leading-relaxed">
              Secure, consent-based identity verification with time-limited tokens. Your documents, your control.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              {["Features", "Security", "How It Works", "Pricing"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Data Policy"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--color-border-default)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} VaultID. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="status-dot status-dot-active" />
            <span className="text-xs text-[var(--color-text-muted)]">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
