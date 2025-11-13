"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthUser = {
  id: string;
  email: string;
  role: string;
};

async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        if (!user) return;
        if (user.role === "admin") router.replace("/admin");
        else router.replace("/dashboard");
      })
      .catch((err) => console.error("Failed to verify session", err));
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid credentials.");
        return;
      }

      const user: AuthUser = data.user;
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-white to-emerald-100 px-4 py-12">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white/80 shadow-2xl backdrop-blur transition hover:shadow-emerald-200/60 md:grid md:grid-cols-[1.1fr_1fr]">
        <div className="relative hidden h-full flex-col justify-between bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(16,185,129,0.2),_transparent_55%)] p-10 text-white md:flex">
          <div>
            <span className="rounded-full bg-white/20 px-4 py-1 text-xs uppercase tracking-[0.35em]">
              Welcome Back
            </span>
            <h1 className="mt-8 text-4xl font-semibold leading-tight">
              AidFusion makes your health journey effortless.
            </h1>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              Talk to AI doctors, translate reports, manage prescriptions, and more from one intuitive dashboard.
            </p>
          </div>
          <div className="mt-10 space-y-4 text-sm text-white/80">
            <p className="font-medium text-white">Why users love AidFusion</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" /> Instant AI guidance
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" /> Personalized insights
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" /> Secure medical records
              </li>
            </ul>
          </div>
        </div>
        <div className="relative flex flex-col justify-center gap-6 p-8 sm:p-12">
          <div className="absolute inset-x-0 top-0 hidden h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400 md:block" />
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Log in to AidFusion</h2>
            <p className="text-sm text-slate-500">
              Your personalized medical copilot is just a step away.
            </p>
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogin}
            disabled={pending}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/40 transition hover:shadow-emerald-300/60 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "Signing in…" : "Login"}
          </button>
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="font-semibold text-emerald-600 transition hover:text-emerald-500"
            >
              Create one now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
