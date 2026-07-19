"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Profile {
  name: string;
  email: string;
  profile_image: string | null;
  display_phrase: string | null;
  about: string | null;
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  imageDataUrl?: string;
}

const GENERATING_MESSAGES = [
  "Your masterpiece is at work...",
  "Mixing colors...",
  "Sketching the shapes...",
  "Adding the finishing touches...",
];

export default function ProfilePage() {
  const { status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [phrase, setPhrase] = useState("");
  const [about, setAbout] = useState("");
  const [suggestingPhrase, setSuggestingPhrase] = useState(false);
  const [savingPhrase, setSavingPhrase] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState(GENERATING_MESSAGES[0]);

  // Cycles through a few different status lines while waiting, so it
  // doesn't feel stuck on one static phrase for what might be several
  // seconds.
  useEffect(() => {
    if (!generating) return;
    let i = 0;
    setGeneratingMessage(GENERATING_MESSAGES[0]);
    const interval = setInterval(() => {
      i = (i + 1) % GENERATING_MESSAGES.length;
      setGeneratingMessage(GENERATING_MESSAGES[i]);
    }, 1800);
    return () => clearInterval(interval);
  }, [generating]);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.profile);
        setPhrase(data.profile?.display_phrase ?? "");
        setAbout(data.profile?.about ?? "");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (status === "authenticated") load();
    else setLoading(false);
  }, [status]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2_000_000) {
      alert("Please choose an image or GIF under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await fetch("/api/profile/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      load();
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    if (!chatPrompt.trim() || generating) return;
    const userMessage: ChatMessage = { role: "user", text: chatPrompt };
    setChatMessages((prev) => [...prev, userMessage]);
    setGenerating(true);
    const promptSent = chatPrompt;
    setChatPrompt("");

    const res = await fetch("/api/profile/generate-avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptSent }),
    });
    const data = await res.json();

    if (!res.ok) {
      setChatMessages((prev) => [...prev, { role: "ai", text: data.error ?? "Something went wrong." }]);
    } else {
      setPendingImage(data.dataUrl);
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "Here's what I generated:", imageDataUrl: data.dataUrl },
      ]);
    }
    setGenerating(false);
  }

  async function useGeneratedImage() {
    if (!pendingImage) return;
    await fetch("/api/profile/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl: pendingImage }),
    });
    setAiPanelOpen(false);
    setChatMessages([]);
    setPendingImage(null);
    load();
  }

  async function handleSuggestPhrase() {
    setSuggestingPhrase(true);
    const res = await fetch("/api/profile/suggest-phrase", { method: "POST" });
    const data = await res.json();
    if (res.ok) setPhrase(data.phrase);
    setSuggestingPhrase(false);
  }

  async function savePhrase() {
    setSavingPhrase(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_phrase: phrase }),
    });
    setSavingPhrase(false);
  }

  async function saveAbout() {
    setSavingAbout(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ about }),
    });
    setSavingAbout(false);
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-paper-dim">Loading...</p>
      </main>
    );
  }

  if (status !== "authenticated" || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="font-mono text-sm text-paper-dim">
          <Link href="/login" className="text-copper-bright hover:underline">
            Sign in
          </Link>{" "}
          to view your profile.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-paper-dim/20 px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
          >
            ← Back to Engineering Pulse
          </Link>

          <h1 className="font-display font-bold text-3xl mb-8">Profile</h1>

          {/* Box 1 — Profile picture */}
          <div className="border border-paper-dim/20 rounded-sm p-6 mb-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-4">
              Profile Picture
            </p>
            <div className="flex items-center gap-5">
              {profile.profile_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profile_image}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border border-paper-dim/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-ink-raised border border-paper-dim/20 flex items-center justify-center font-mono text-lg text-paper-dim">
                  {getInitialsLocal(profile.name, profile.email)}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 border border-paper-dim/30 rounded-sm font-mono text-xs hover:border-copper/50 hover:text-copper-bright transition-colors"
                >
                  Upload image or GIF
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => setAiPanelOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-copper/40 rounded-sm font-mono text-xs text-copper-bright hover:bg-copper/10 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
                  </svg>
                  Generate with AI
                </button>
              </div>
            </div>
          </div>

          {/* AI generation mini-chat panel */}
          {aiPanelOpen && (
            <div className="border border-copper/40 rounded-sm p-5 mb-6 bg-ink-raised/40">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-xs uppercase tracking-widest text-copper-bright">
                  AI Picture Generator
                </p>
                <button
                  onClick={() => setAiPanelOpen(false)}
                  className="font-mono text-xs text-paper-dim hover:text-copper-bright transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                {chatMessages.length === 0 && (
                  <p className="font-mono text-xs text-paper-dim">
                    Describe what you'd like for your profile picture — e.g. "a geometric copper
                    circuit pattern" or "an abstract gear made of hexagons."
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
                    <p
                      className={`inline-block px-3 py-2 rounded-sm text-xs font-mono max-w-xs ${
                        msg.role === "user"
                          ? "bg-copper text-ink"
                          : "bg-ink border border-paper-dim/20 text-paper-dim"
                      }`}
                    >
                      {msg.text}
                    </p>
                    {msg.imageDataUrl && (
                      <div className="mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.imageDataUrl}
                          alt="Generated"
                          className="w-32 h-32 rounded-sm border border-paper-dim/20 mx-auto"
                        />
                      </div>
                    )}
                  </div>
                ))}
                {generating && (
                  <div className="text-left">
                    <p className="inline-flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-mono bg-ink border border-paper-dim/20 text-paper-dim">
                      <span>{generatingMessage}</span>
                      <span className="inline-flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-copper-bright animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-1 rounded-full bg-copper-bright animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-1 rounded-full bg-copper-bright animate-bounce" />
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {pendingImage && (
                <button
                  onClick={useGeneratedImage}
                  className="w-full mb-3 py-2 bg-pcb text-ink rounded-sm font-mono text-xs hover:opacity-90 transition-opacity"
                >
                  Use this as my profile picture
                </button>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="Describe your picture..."
                  className="flex-1 px-3 py-2 bg-ink border border-paper-dim/30 rounded-sm text-xs font-mono focus:outline-none focus:border-copper/50"
                />
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-copper text-ink rounded-sm font-mono text-xs hover:bg-copper-bright transition-colors disabled:opacity-50"
                >
                  {generating ? "..." : "Send"}
                </button>
              </form>
            </div>
          )}

          {/* Box 2 — Display phrase */}
          <div className="border border-paper-dim/20 rounded-sm p-6 mb-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-4">
              Display Phrase
            </p>
            <input
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="A short tagline for your profile..."
              className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={savePhrase}
                disabled={savingPhrase}
                className="px-3 py-1.5 bg-copper text-ink rounded-sm font-mono text-xs hover:bg-copper-bright transition-colors disabled:opacity-50"
              >
                {savingPhrase ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleSuggestPhrase}
                disabled={suggestingPhrase}
                className="px-3 py-1.5 border border-paper-dim/30 rounded-sm font-mono text-xs hover:border-copper/50 hover:text-copper-bright transition-colors disabled:opacity-50"
              >
                {suggestingPhrase ? "Thinking..." : "✨ AI Suggest"}
              </button>
            </div>
          </div>

          {/* Box 3 — About */}
          <div className="border border-paper-dim/20 rounded-sm p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-4">
              About
            </p>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Write a bit about yourself..."
              rows={6}
              className="w-full px-3 py-2 bg-ink-raised border border-paper-dim/30 rounded-sm text-sm focus:outline-none focus:border-copper/50 resize-y mb-3"
            />
            <button
              onClick={saveAbout}
              disabled={savingAbout}
              className="px-3 py-1.5 bg-copper text-ink rounded-sm font-mono text-xs hover:bg-copper-bright transition-colors disabled:opacity-50"
            >
              {savingAbout ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function getInitialsLocal(name: string | null, email: string | null) {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}
