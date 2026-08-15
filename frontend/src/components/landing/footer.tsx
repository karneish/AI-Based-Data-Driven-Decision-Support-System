import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
              An AI-based, data-driven decision support system for student
              performance. Predict, classify, simulate and recommend — powered
              entirely by free, in-memory machine learning.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-ink-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              No student data is stored anywhere.
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Product</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li><Link href="/login" className="transition hover:text-primary">Dashboard</Link></li>
              <li><Link href="/login" className="transition hover:text-primary">Simulator</Link></li>
              <li><Link href="/login" className="transition hover:text-primary">Model insights</Link></li>
              <li><a href="#features" className="transition hover:text-primary">Features</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Platform</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li className="flex items-center gap-1.5">Next.js on Vercel</li>
              <li className="flex items-center gap-1.5">FastAPI on Render</li>
              <li className="flex items-center gap-1.5">scikit-learn engine</li>
              <li className="flex items-center gap-1.5">TypeScript throughout</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} DSS-MIP. Built for academic research.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="h-3 w-3 text-rose-500" fill="currentColor" /> on a 100% free stack
          </p>
        </div>
      </div>
    </footer>
  )
}
