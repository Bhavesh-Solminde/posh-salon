"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Seal } from "@/components/ui/Seal";
import { AdminButton } from "@/components/admin/AdminButton";
import { Field, Input } from "@/components/admin/ui/Field";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Sign-in only works once React is listening. Until then the button ships
  // disabled, so an early click can't fall through to a native form submit —
  // which would put the password in the URL.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  // Read the credentials off the form itself rather than from React state: a
  // cashier who starts typing before the page finishes hydrating would
  // otherwise submit an empty form and be told their email is invalid.
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (!email || !password) {
      setError("Enter both your email and password to sign in.");
      return;
    }

    setError(null);
    setLoading(true);
    const res = await signIn.email({ email, password });
    if (res.error) {
      setLoading(false);
      setError(
        res.error.message ??
          "That email and password don't match a staff account. Check both and try again.",
      );
      return;
    }

    // Read the post-login destination from the URL at submit time (avoids a
    // Suspense boundary just for useSearchParams).
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next && next.startsWith("/admin") ? next : "/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-warm-white px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Seal size="lg" />
          <h1 className="mt-6 font-display text-ui-title text-ink">Posh Salon</h1>
          <p className="mt-1 text-meta uppercase text-ink-muted">Staff Sign In</p>
        </div>

        <form
          onSubmit={onSubmit}
          method="post"
          noValidate
          className="mt-8 space-y-5 border border-warm-line bg-warm-panel p-8"
        >
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>

          {error && (
            <p className="text-ui-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <AdminButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading || !ready}
            className="w-full"
          >
            {loading ? "Signing in…" : "Sign In"}
          </AdminButton>
        </form>

        <p className="mt-6 text-center text-ui-sm text-ink-muted">
          Staff accounts are created by an administrator.
        </p>
      </div>
    </main>
  );
}
