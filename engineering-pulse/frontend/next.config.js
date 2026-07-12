/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js auto-detects Google Fonts / Typekit <link> tags and tries to
  // download + self-host them at BUILD time for performance, even when
  // not using next/font. That build-time fetch is what caused the
  // intermittent Vercel build failures — disabling it means fonts load
  // normally in the browser at runtime instead, with zero network
  // dependency during the build itself.
  optimizeFonts: false,
};

module.exports = nextConfig;
