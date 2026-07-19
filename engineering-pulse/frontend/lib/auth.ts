import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import PostgresAdapter from "@auth/pg-adapter";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(getPool()) as NextAuthOptions["adapter"],
  // JWT sessions, not database sessions — NextAuth's Credentials provider
  // (email+password) doesn't support database sessions at all: login
  // appears to succeed but no session actually gets created afterward.
  // JWT sessions work correctly with all three providers (Google, email
  // magic-link, and Credentials). The adapter is still used for storing
  // Google account links and magic-link verification tokens.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // Magic link — sends a one-time sign-in link via email. Uses Gmail's
    // SMTP relay with an App Password (free, no separate email service
    // needed) rather than a dedicated transactional email provider.
    EmailProvider({
      server: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      },
      from: process.env.GMAIL_USER,
    }),

    // Email + password — custom credentials check against the
    // password_hash column added to users in the migration.
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await getPool().query(
          `SELECT id, name, email, password_hash FROM users WHERE email = $1`,
          [credentials.email]
        );
        const user = result.rows[0];
        if (!user || !user.password_hash) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { isAdmin?: boolean }).isAdmin =
          !!session.user.email &&
          session.user.email.toLowerCase() === (process.env.ADMIN_EMAIL ?? "").toLowerCase();
      }
      return session;
    },
  },
};
