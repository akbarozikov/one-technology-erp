"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type LoginResponse = {
  data?: {
    user?: {
      identifier?: string;
      name?: string;
    };
  };
  error?: {
    message?: string;
  };
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = useMemo(() => {
    const nextParam = searchParams.get("next");
    if (!nextParam || !nextParam.startsWith("/")) {
      return "/admin";
    }
    return nextParam;
  }, [searchParams]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ identifier, password }),
      });

      const payload = (await response.json().catch(() => null)) as LoginResponse | null;
      if (!response.ok) {
        throw new Error(payload?.error?.message || "Login failed.");
      }

      router.replace(nextTarget);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="app-panel-strong w-full max-w-md p-6 lg:p-7">
      <div className="space-y-2">
        <p className="app-kicker">Protected access</p>
        <h1 className="app-page-title text-[1.9rem]">Sign in to One Technology ERP</h1>
        <p className="app-page-subtitle max-w-none">
          Use your staging access credentials to enter the seller, boss, or advanced workspace.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">Email or login</span>
          <input
            type="text"
            name="identifier"
            autoComplete="username"
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="app-input"
            placeholder="Enter your identifier"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="app-input"
            placeholder="Enter your password"
          />
        </label>

        {error && (
          <div className="rounded-[1rem] border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="app-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-5 rounded-[1rem] border border-black/6 bg-black/[0.02] px-4 py-3 text-sm text-zinc-600 dark:border-white/8 dark:bg-white/[0.03] dark:text-zinc-300">
        Need the full ERP after signing in? Advanced mode stays available inside the protected workspace.
      </div>

      <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="app-link">Back to entry</Link>
      </div>
    </section>
  );
}
