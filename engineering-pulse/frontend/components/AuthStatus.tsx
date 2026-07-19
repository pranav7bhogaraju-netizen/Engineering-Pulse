"use client";

import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch the actual saved profile picture (set on /profile) — without
  // this, the avatar can only ever show initials, since next-auth's own
  // session object doesn't know about our custom profile_image field.
  useEffect(() => {
    if (status !== "authenticated") {
      setProfileImage(null);
      return;
    }
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setProfileImage(data.profile?.profile_image ?? null))
      .catch(() => setProfileImage(null));
  }, [status]);

  if (status === "loading") {
    return <div className="w-7 h-7" />; // reserve space, avoid layout shift
  }

  if (status === "authenticated") {
    const initials = getInitials(session.user?.name, session.user?.email);
    return (
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          title={session.user?.name ?? session.user?.email ?? undefined}
          className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-copper text-ink font-mono text-[11px] font-medium hover:bg-copper-bright transition-colors"
        >
          {profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-9 w-40 bg-ink-raised border border-paper-dim/20 rounded-sm shadow-lg z-50 overflow-hidden">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 font-mono text-xs text-paper-dim hover:text-copper-bright hover:bg-ink transition-colors"
            >
              View Profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: pathname })}
              className="w-full text-left px-3 py-2.5 font-mono text-xs text-red-400 hover:bg-ink transition-colors border-t border-paper-dim/10"
            >
              ● Sign out
            </button>
          </div>
        )}
      </div>
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
