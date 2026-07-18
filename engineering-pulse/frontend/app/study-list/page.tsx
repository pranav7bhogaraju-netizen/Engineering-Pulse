"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface StudyItem {
  id: number;
  title: string;
  url: string;
  description: string;
  resource_type: string;
  position: number;
  note: string | null;
}

export default function StudyList() {
  const { status } = useSession();
  const [items, setItems] = useState<StudyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [savingNoteFor, setSavingNoteFor] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    fetch("/api/study-list")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  function persistOrder(newItems: StudyItem[]) {
    fetch("/api/study-list/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newItems.map((i) => i.id) }),
    });
  }

  function handleDragStart(id: number) {
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent, overId: number) {
    e.preventDefault();
    if (draggedId === null || draggedId === overId) return;

    const draggedIndex = items.findIndex((i) => i.id === draggedId);
    const overIndex = items.findIndex((i) => i.id === overId);
    if (draggedIndex === -1 || overIndex === -1) return;

    const reordered = [...items];
    const [dragged] = reordered.splice(draggedIndex, 1);
    reordered.splice(overIndex, 0, dragged);
    setItems(reordered);
  }

  function handleDragEnd() {
    setDraggedId(null);
    persistOrder(items);
  }

  async function handleNoteChange(id: number, note: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, note } : i)));
  }

  async function saveNote(id: number, note: string | null) {
    setSavingNoteFor(id);
    await fetch(`/api/study-list/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setSavingNoteFor(null);
  }

  async function removeItem(id: number) {
    await fetch(`/api/resources/${id}/save`, { method: "POST" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-paper-dim">Loading...</p>
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="font-mono text-sm text-paper-dim">
          <Link href="/login" className="text-copper-bright hover:underline">
            Sign in
          </Link>{" "}
          to view your study list.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-paper-dim/20 px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/resources"
            className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
          >
            ← Back to Resources
          </Link>

          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Study List</h1>
          <p className="text-paper-dim mb-8">
            Your saved resources, in your order. Drag to rearrange, add notes for yourself.
          </p>

          {items.length === 0 ? (
            <p className="font-mono text-sm text-paper-dim py-12 text-center">
              Nothing saved yet —{" "}
              <Link href="/resources" className="text-copper-bright hover:underline">
                browse resources
              </Link>{" "}
              and hit ☆ Save on anything useful.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={`border border-paper-dim/20 rounded-sm p-4 bg-ink-raised/40 cursor-grab active:cursor-grabbing transition-opacity ${
                    draggedId === item.id ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-paper-dim font-mono text-xs pt-1 select-none">⠿</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display font-medium hover:text-copper-bright transition-colors"
                        >
                          {item.title}
                        </a>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="font-mono text-[11px] text-paper-dim hover:text-copper transition-colors shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-sm text-paper-dim mt-1 mb-3">{item.description}</p>
                      <textarea
                        placeholder="Add a personal note..."
                        value={item.note ?? ""}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        onBlur={(e) => saveNote(item.id, e.target.value || null)}
                        rows={2}
                        className="w-full px-3 py-2 bg-ink border border-paper-dim/20 rounded-sm text-xs font-mono focus:outline-none focus:border-copper/50 resize-y"
                      />
                      {savingNoteFor === item.id && (
                        <p className="font-mono text-[10px] text-paper-dim mt-1">Saving...</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
