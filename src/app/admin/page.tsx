"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Failed to logout", error);
    } finally {
      router.replace("/login");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.user) {
          router.replace("/login");
          return;
        }

        if (data.user.role !== "admin") {
          alert("Access denied!");
          router.replace("/dashboard");
          return;
        }

        if (isMounted) {
          setUser(data.user as AuthUser);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to verify admin session", error);
        router.replace("/login");
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 text-white">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/10 px-8 py-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-teal-200/80">Admin Control</p>
            <h1 className="text-3xl font-semibold">Welcome back, {user?.email}</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
          >
            Logout
          </button>
        </div>
        <div className="space-y-6 px-8 py-10">
          <p className="text-lg font-medium text-white/90">
            You are signed in as <span className="font-semibold text-emerald-300">{user?.role}</span>.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md">
              <p className="text-sm uppercase tracking-wide text-emerald-200/80">Quick Tip</p>
              <p className="mt-2 text-sm text-white/80">
                Use the dashboard sidebar to manage AI experiences and explore user-facing tools.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md">
              <p className="text-sm uppercase tracking-wide text-emerald-200/80">Need to test signup?</p>
              <p className="mt-2 text-sm text-white/80">
                Click logout above, then head to the signup page to create a fresh user session instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
