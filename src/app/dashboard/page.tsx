"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";

type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

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

        if (isMounted) {
          setUser(data.user as AuthUser);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch session", error);
        router.replace("/login");
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AppShell key={user.id} user={user} />;
}

