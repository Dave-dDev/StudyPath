"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const path = usePathname();
  const isHome = path === "/";
  const { user, loading, signOut } = useAuth();

  return (
    <nav className={cn(
      "w-full h-16 flex items-center justify-between px-8 md:px-16",
      isHome ? "bg-transparent absolute top-0 z-10" : "bg-white border-b border-gray-100 sticky top-0 z-50"
    )}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-7 h-7 bg-teal-400 rounded-lg flex items-center justify-center group-hover:bg-teal-700 transition-colors">
          <BookOpen size={15} className="text-white" />
        </div>
        <span className="font-bold text-[18px] text-ink">StudyPath</span>
      </Link>

      {/* Nav links — hidden on mobile */}
      {isHome && (
        <div className="hidden md:flex items-center gap-9 text-sm font-medium text-gray-600">
          {["Features", "How it works", "Pricing"].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="hover:text-ink transition-colors">{l}</a>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center gap-3">
        {loading ? (
          <Loader2 size={18} className="animate-spin text-gray-400" />
        ) : user ? (
          <>
            <Link href="/dashboard" className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Dashboard
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-ink hover:bg-gray-100 transition-colors"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
            <Link href="/login" className="btn-primary text-sm px-5 py-2.5">
              Get started free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
