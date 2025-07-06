import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { type User as PrismaUser, type Prisma } from "@prisma/client";

import { db } from "~/server/db";
import { env } from "~/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      subscriptionPlan: PrismaUser["subscriptionPlan"];
    } & DefaultSession["user"];
  }

  interface User extends Omit<PrismaUser, "password"> {
    password?: string | null;
  }
}

// Create a custom adapter with type assertion to avoid type conflicts
const customAdapter = PrismaAdapter(db) as any;

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider({
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    }),
    GitHubProvider({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userSelect = {
          id: true,
          email: true,
          name: true,
          password: true,
          image: true,
          emailVerified: true,
          subscriptionPlan: true,
          createdAt: true,
          updatedAt: true,
        } satisfies Prisma.UserSelect;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          select: userSelect,
        });

        if (!user?.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          subscriptionPlan: user.subscriptionPlan,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      },
    }),
  ],
  adapter: customAdapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub ?? "",
        subscriptionPlan:
          token.subscriptionPlan as PrismaUser["subscriptionPlan"],
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          subscriptionPlan: user.subscriptionPlan,
        };
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
