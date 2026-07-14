"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function Login() {
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);

  // If someone lands on /login while already signed in — including right
  // after clicking a magic link, which by default redirects back to
  // wherever it was requested from (this very page) — send them onward
  // instead of showing the sign-in form again.
  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/blogs";
    }
  }, [status]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Incorrect email or password.");
    } else {
      window.location.href = "/blogs";
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (sendingMagicLink) return; // ignore rapid double-clicks/re-submits
    setError(null);
    setSendingMagicLink(true);
    await signIn("email", { email: magicEmail, redirect: false, callbackUrl: "/blogs" });
    setSendingMagicLink(false);
    setMagicLinkSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
        >
          ← Back to Engineering Pulse
        </Link>

        <h1 className="font-display font-bold text-2xl mb-8">Sign in</h1>

        <button
          onClick={() => signIn("google", { callbackUrl: "/blogs" })}
          className="w-full mb-6 py-2.5 border border-paper-dim/30 rounded-sm font-mono text-sm hover:border-copper/50 hover:text-copper-bright transition-colors"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-paper-dim/20" />
          <span className="font-mono text-[11px] text-paper-dim uppercase">or</span>
          <div className="flex-1 h-px bg-paper-dim/20" />
        </div>

        <form onSubmit={handlePasswordLogin} className="space-y-3 mb-6">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
          />
          {error && <p className="text-copper text-xs font-mono">{error}</p>}
          <button
            type="submit"
            className="w-full py-2.5 bg-copper text-ink rounded-sm font-mono text-sm hover:bg-copper-bright transition-colors"
          >
            Sign in with password
          </button>
        </form>

        <p className="font-mono text-xs text-paper-dim mb-6">
          No account?{" "}
          <Link href="/signup" className="text-copper-bright hover:underline">
            Sign up
          </Link>
        </p>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-paper-dim/20" />
          <span className="font-mono text-[11px] text-paper-dim uppercase">or</span>
          <div className="flex-1 h-px bg-paper-dim/20" />
        </div>

        {magicLinkSent ? (
          <p className="font-mono text-sm text-pcb">
            Check your inbox — a sign-in link has been sent to {magicEmail}.
          </p>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Email for a magic link"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
            />
            <button
              type="submit"
              disabled={sendingMagicLink}
              className="w-full py-2.5 border border-paper-dim/30 rounded-sm font-mono text-sm hover:border-copper/50 hover:text-copper-bright transition-colors disabled:opacity-50"
            >
              {sendingMagicLink ? "Sending..." : "Email me a sign-in link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
