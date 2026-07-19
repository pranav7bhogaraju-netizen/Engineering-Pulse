"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DOMAINS } from "@/lib/mockData";

export default function NavPanel() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  const [open, setOpen] = useState(false);
  const [resourcesExpanded, setResourcesExpanded] = useState(false);

  function close() {
    setOpen(false);
    setResourcesExpanded(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="w-9 h-9 flex items-center justify-center border border-paper-dim/30 rounded-sm text-paper-dim hover:text-copper-bright hover:border-copper/50 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      {/* Backdrop — fades in/out, click to close */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-ink/70 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel — slides in from the left */}
      <nav
        className={`fixed top-0 left-0 h-full w-72 bg-ink-raised border-r border-paper-dim/20 z-50 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <button
            onClick={close}
            aria-label="Close navigation menu"
            className="mb-8 text-paper-dim hover:text-copper-bright transition-colors font-mono text-xs uppercase tracking-widest"
          >
            ✕ Close
          </button>

          <div className="space-y-1 font-mono text-sm uppercase tracking-wide">
            <Link
              href="/"
              onClick={close}
              className="block py-3 text-paper hover:text-copper-bright transition-colors border-b border-paper-dim/10"
            >
              Home
            </Link>

            <button
              onClick={() => setResourcesExpanded((v) => !v)}
              className="w-full flex items-center justify-between py-3 text-paper hover:text-copper-bright transition-colors border-b border-paper-dim/10"
            >
              Resources
              <span
                className={`transition-transform duration-200 ${resourcesExpanded ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {/* Accordion — animates open/closed via max-height, since height:auto can't transition directly */}
            <div
              className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
                resourcesExpanded ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="py-2 pl-4 flex flex-col gap-1 normal-case tracking-normal text-xs">
                <Link
                  href="/resources/submit"
                  onClick={close}
                  className="py-1.5 text-copper-bright hover:underline transition-colors"
                >
                  + Submit a Resource
                </Link>
                <Link
                  href="/resources"
                  onClick={close}
                  className="py-1.5 text-paper-dim hover:text-copper-bright transition-colors border-b border-paper-dim/10 mb-1 pb-2.5"
                >
                  All Resources
                </Link>
                {DOMAINS.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/resources?domain=${d.slug}`}
                    onClick={close}
                    className="py-1.5 text-paper-dim hover:text-copper-bright transition-colors"
                  >
                    {d.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/study-list"
              onClick={close}
              className="block py-3 text-paper hover:text-copper-bright transition-colors border-b border-paper-dim/10"
            >
              Study List
            </Link>

            <Link
              href="/blogs"
              onClick={close}
              className="block py-3 text-paper hover:text-copper-bright transition-colors border-b border-paper-dim/10"
            >
              Blogs
            </Link>
            <Link
              href="/about"
              onClick={close}
              className="block py-3 text-paper hover:text-copper-bright transition-colors border-b border-paper-dim/10"
            >
              About
            </Link>

            {isAdmin && (
              <Link
                href="/admin/resources"
                onClick={close}
                className="block py-3 text-copper-bright hover:underline transition-colors"
              >
                ⚙ Pending Review
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
