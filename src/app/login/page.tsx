"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api/auth";
import { getStoredSession, saveSession } from "@/lib/auth/session";

export default function LoginPage() {
  return <Suspense fallback={<main className="page-loading">Loading sign in...</main>}><LoginForm /></Suspense>;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getStoredSession()) router.replace("/products");
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (!username.trim() || !password) {
      setError("Enter both your username and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const response = await login({ username: username.trim(), password });
      saveSession(response);
      router.replace(searchParams.get("next") || "/products");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="brand-mark">NORTHSTAR / OPS</div>
        <p className="eyebrow">Product intelligence workspace</p>
        <h1 id="login-title">Welcome back.</h1>
        <p className="muted-copy">Sign in to manage your catalog with clarity.</p>
        {searchParams.get("expired") ? <p className="notice" role="status">Your session expired. Please sign in again.</p> : null}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="login-hint">Demo access is prefilled for the product operations team.</p>
      </section>
      <aside className="auth-aside"><span className="aside-label">CATALOG / 01</span><h2>Every product, accounted for.</h2><p>Track inventory, pricing, and customer signals from one calm operating view.</p></aside>
    </main>
  );
}
