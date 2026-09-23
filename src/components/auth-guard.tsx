"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredSession } from "@/lib/auth/session";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getStoredSession()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const handleExpired = () => router.replace("/login?expired=1");
    window.addEventListener("auth-expired", handleExpired);
    const readyTimer = window.setTimeout(() => setReady(true), 0);
    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener("auth-expired", handleExpired);
    };
  }, [pathname, router]);

  return ready ? children : <main className="page-loading">Checking your session...</main>;
}