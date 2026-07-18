"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-16 h-4" />; // reserve space, avoid layout shift
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-pcb" title="Signed in">
          ●
        </span>
        <span className="text-paper-dim">{session.user?.name ?? session.user?.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-paper-dim hover:text-copper-bright transition-colors underline decoration-dotted"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="font-mono text-xs uppercase tracking-wide text-paper-dim hover:text-copper-bright transition-colors"
    >
      Sign in
    </Link>
  );
}
