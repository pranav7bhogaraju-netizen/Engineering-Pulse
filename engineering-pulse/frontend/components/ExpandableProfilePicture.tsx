"use client";

import { useState } from "react";

export default function ExpandableProfilePicture({
  imageUrl,
  prompt,
  fallbackInitials,
  size = 80,
}: {
  imageUrl: string | null;
  prompt: string | null;
  fallbackInitials: string;
  size?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [promptRevealed, setPromptRevealed] = useState(false);

  function close() {
    setExpanded(false);
    setPromptRevealed(false);
  }

  return (
    <>
      <button
        onClick={() => imageUrl && setExpanded(true)}
        className={imageUrl ? "cursor-zoom-in" : "cursor-default"}
        style={{ width: size, height: size }}
        aria-label={imageUrl ? "Expand profile picture" : undefined}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border border-paper-dim/20"
          />
        ) : (
          <div
            className="w-full h-full rounded-full bg-ink-raised border border-paper-dim/20 flex items-center justify-center font-mono text-paper-dim"
            style={{ fontSize: size * 0.28 }}
          >
            {fallbackInitials}
          </div>
        )}
      </button>

      {expanded && imageUrl && (
        <div
          onClick={close}
          className="fixed inset-0 bg-ink/90 z-50 flex items-center justify-center p-6"
        >
          <div onClick={(e) => e.stopPropagation()} className="max-w-md w-full flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Profile (expanded)"
              className="max-w-full max-h-[70vh] rounded-sm border border-paper-dim/30 object-contain"
            />

            <div className="flex items-center gap-3 mt-4">
              {prompt && !promptRevealed && (
                <button
                  onClick={() => setPromptRevealed(true)}
                  className="px-3 py-1.5 border border-copper/40 rounded-sm font-mono text-xs text-copper-bright hover:bg-copper/10 transition-colors"
                >
                  🔍 Find Prompt
                </button>
              )}
              <button
                onClick={close}
                className="px-3 py-1.5 border border-paper-dim/30 rounded-sm font-mono text-xs text-paper-dim hover:text-copper-bright transition-colors"
              >
                Close
              </button>
            </div>

            {prompt && promptRevealed && (
              <div className="mt-4 px-4 py-3 bg-ink-raised border border-copper/30 rounded-sm max-w-sm">
                <p className="font-mono text-[10px] uppercase tracking-widest text-copper-bright mb-1">
                  Generation prompt
                </p>
                <p className="text-sm text-paper-dim italic">"{prompt}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
