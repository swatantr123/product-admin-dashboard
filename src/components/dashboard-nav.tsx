"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredSession, getStoredSession } from "@/lib/auth/session";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Operator");

  useEffect(() => {
    const readyTimer = window.setTimeout(() => {
      const user = getStoredSession()?.user;
      if (user) setUserName(`${user.firstName} ${user.lastName}`);
    }, 0);
    return () => window.clearTimeout(readyTimer);
  }, []);

  function logout() {
    clearStoredSession();
    router.replace("/login");
  }

  return <div className="dashboard-nav"><nav aria-label="Primary navigation"><Link className={pathname.startsWith("/products") ? "active" : ""} href="/products">Products</Link><Link className={pathname === "/products/new" ? "active" : ""} href="/products/new">New product</Link></nav><div className="user-controls"><span className="user-name">{userName}</span><button className="text-button" onClick={logout}>Log out</button></div></div>;
}