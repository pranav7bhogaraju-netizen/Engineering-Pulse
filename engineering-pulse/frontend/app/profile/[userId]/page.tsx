"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ExpandableProfilePicture from "@/components/ExpandableProfilePicture";

interface PublicProfile {
  name: string;
  profile_image: string | null;
  profile_image_prompt: string | null;
  display_phrase: string | null;
  about: string | null;
  created_at: string;
}

function getInitials(name: string | null) {
  const source = name?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => setProfile(data.profile))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-paper-dim">Loading...</p>
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="font-mono text-sm text-paper-dim">Profile not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-paper-dim/20 px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/blogs"
            className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
          >
            ← Back to discussions
          </Link>

          <div className="flex items-center gap-5 mb-8">
            <ExpandableProfilePicture
              imageUrl={profile.profile_image}
              prompt={profile.profile_image_prompt}
              fallbackInitials={getInitials(profile.name)}
              size={80}
            />
            <div>
              <h1 className="font-display font-bold text-2xl mb-1">{profile.name}</h1>
              <p className="font-mono text-xs text-paper-dim">
                Joined {formatJoinDate(profile.created_at)}
              </p>
            </div>
          </div>

          {profile.display_phrase && (
            <p className="text-copper-bright italic mb-8">"{profile.display_phrase}"</p>
          )}

          {profile.about && (
            <div className="border border-paper-dim/20 rounded-sm p-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-paper-dim mb-3">
                About
              </p>
              <p className="text-sm text-paper-dim leading-relaxed whitespace-pre-wrap">
                {profile.about}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
