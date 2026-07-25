"use client";
import { usePathname } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Loading() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-sm text-gray-400 mt-4">
          Loading {pathname === "/dashboard" ? "dashboard" : pathname === "/upload" ? "upload page" : "page"}…
        </p>
      </div>
    </div>
  );
}
