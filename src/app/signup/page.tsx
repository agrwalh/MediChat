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

export default function SignupPage() {
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

  const handleSignup = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error during signup.");
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-sky-100 px-4 py-12">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white/85 shadow-2xl backdrop-blur transition hover:shadow-sky-200/60 md:grid md:grid-cols-[1.1fr_1fr]">
        <div className="relative hidden h-full flex-col justify-between bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(59,130,246,0.2),_transparent_55%)] p-10 text-white md:flex">
          <div>
            <span className="rounded-full bg-white/20 px-4 py-1 text-xs uppercase tracking-[0.35em]">
              Join the future
            </span>
            <h1 className="mt-8 text-4xl font-semibold leading-tight">
              Craft a smarter, calmer healthcare experience with AidFusion.
            </h1>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              Set up your account in minutes and get curated insights, AI consultations, and proactive health nudges.
            </p>
          </div>
          <div className="mt-10 space-y-4 text-sm text-white/80">
            <p className="font-medium text-white">Inside your workspace</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" /> Guided symptom analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" /> Secure health timeline
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" /> One-click report translation
              </li>
            </ul>
          </div>
        </div>
        <div className="relative flex flex-col justify-center gap-6 p-8 sm:p-12">
          <div className="absolute inset-x-0 top-0 hidden h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-400 md:block" />
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Create your AidFusion account</h2>
            <p className="text-sm text-slate-500">
              Stay on top of treatments, reports, and wellness milestones with a single login.
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleSignup}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200/40 transition hover:shadow-sky-300/60 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={pending}
          >
            {pending ? "Signing up…" : "Create account"}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already on AidFusion?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-semibold text-sky-600 transition hover:text-sky-500"
            >
              Log in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
