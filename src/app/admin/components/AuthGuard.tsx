"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated" && pathname.startsWith("/admin")) {
      router.push("/auth/login");
    }
  }, [status, pathname, router]);

  // While checking authentication, show a loading state with the same gradient background to prevent a harsh white flash
  if (status === "loading") {
    return (
      <div className="font-satoshi relative flex h-screen w-full items-center justify-center bg-linear-to-br from-[#e0e5ff] to-[#f3e7e9] dark:from-[#0B1425] dark:to-[#1A1A2E]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  // If not authenticated, still don't render children to prevent content flash before redirect
  if (status === "unauthenticated" && pathname.startsWith("/admin")) {
    return (
      <div className="font-satoshi relative flex h-screen w-full items-center justify-center bg-linear-to-br from-[#e0e5ff] to-[#f3e7e9] dark:from-[#0B1425] dark:to-[#1A1A2E]">
      </div>
    );
  }

  return <>{children}</>;
}
