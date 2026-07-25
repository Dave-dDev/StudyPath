"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Home, Library, Calendar, BarChart2, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",  icon: Home },
  { href: "/upload",     label: "New Study Set", icon: Library },
  { href: "/dashboard",  label: "Review Due", icon: Calendar },
  { href: "/dashboard",  label: "Analytics",  icon: BarChart2 },
  { href: "/dashboard",  label: "Settings",   icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside className="w-[240px] h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-100">
        <div className="w-6 h-6 bg-teal-400 rounded-lg flex items-center justify-center">
          <BookOpen size={13} className="text-white" />
        </div>
        <span className="font-bold text-base text-ink">StudyPath</span>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active
                  ? "bg-teal-50 text-teal-700 font-semibold"
                  : "text-gray-600 font-medium hover:bg-gray-50 hover:text-ink"
              )}
            >
              <Icon size={16} className={active ? "text-teal-400" : "text-gray-400"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user strip */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink truncate">
              {user?.email ?? "Guest"}
            </p>
            <p className="text-[11px] text-gray-400">Free plan</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-gray-400 hover:text-ink hover:bg-gray-100 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
