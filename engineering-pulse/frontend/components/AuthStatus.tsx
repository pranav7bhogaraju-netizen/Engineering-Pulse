"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="w-7 h-7" />; // reserve space, avoid layout shift
  }

  if (status === "authenticated") {
    const initials = getInitials(session.user?.name, session.user?.email);
    return (
      <button
        onClick={() => signOut({ callbackUrl: pathname })}
        title={`Signed in as ${session.user?.name ?? session.user?.email} — click to sign out`}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-copper text-ink font-mono text-[11px] font-medium hover:bg-copper-bright transition-colors"
      >
        {initials}
      </button>
    );
  }

  return (
    <Link
      href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
      className="font-mono text-xs uppercase tracking-wide text-paper-dim hover:text-copper-bright transition-colors"
    >
      Sign in
    </Link>
  );
}
