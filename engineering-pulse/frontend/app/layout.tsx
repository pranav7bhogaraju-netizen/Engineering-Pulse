import type { Metadata } from "next";
import "./globals.css";

// Fonts loaded via a static <link> instead of next/font/google. next/font
// fetches font files from Google during the BUILD itself, which failed
// intermittently on Vercel's build machines (unrelated to this project's
// code). A plain <link> defers fetching to the browser at page-load time,
// same as any normal website, so a flaky network moment during build can
// no longer break the deploy.
export const metadata: Metadata = {
  title: "Engineering Pulse — AI-Ranked Engineering Signals",
  description:
    "Technical papers and industry news across every engineering discipline, ranked separately, for students and working engineers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
