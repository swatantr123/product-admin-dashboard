"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredSession } from "@/lib/auth/session";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getStoredSession() ? "/products" : "/login");
  }, [router]);

  return <main className="page-loading">Loading workspace...</main>;
}