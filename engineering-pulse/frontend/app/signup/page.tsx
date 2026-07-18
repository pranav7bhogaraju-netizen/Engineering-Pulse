"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SignupContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Account created — please sign in.");
      setLoading(false);
    } else {
      window.location.href = callbackUrl;
    }
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

        <h1 className="font-display font-bold text-2xl mb-8">Create an account</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
          />
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
            placeholder="Password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50"
          />
          {error && <p className="text-copper text-xs font-mono">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-copper text-ink rounded-sm font-mono text-sm hover:bg-copper-bright transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="font-mono text-xs text-paper-dim mt-6">
          Already have an account?{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="text-copper-bright hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
