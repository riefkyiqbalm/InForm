// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { Role } from "@sharedUI/types";
import { AUTH_SECRET } from "@/lib/auth"; // Impor dari lib Anda

// const MY_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-prod";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          // ✅ USE THE IMPORTED 'prisma' INSTANCE
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!dbUser) {
            const randomPassword = Math.random().toString(36).slice(-10);
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "",
                image: user.image || "",
                password: randomPassword,
                role: "USER" as Role,
              },
            });
          } else {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                name: user.name || dbUser.name,
                image: user.image || dbUser.image,
              },
            });
          }

          user.id = dbUser.id.toString();
          return true;
        } catch (error) {
          console.error("SignIn Error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        const customToken = jwt.sign(
          { userId: user.id, email: token.email },
          AUTH_SECRET,
          { expiresIn: "7d" },
        );
        token.customAccessToken = customToken;

        // DEBUG LOG: Check if token is generated
        // console.log(
        //   "🔑 [NextAuth JWT] Generated Custom Token:",
        //   customToken ? "YES" : "NO",
        // );
        // console.log(
        //   "🔑 [NextAuth JWT] Token Start:",
        //   customToken ? customToken.substring(0, 20) + "..." : "NONE",
        // );
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.customAccessToken as string;
        session.googleAccessToken = token.accessToken as string;

        // DEBUG LOG: Check what we are sending to client
        // console.log(
        //   "📤 [NextAuth Session] Sending AccessToken to Client:",
        //   session.accessToken ? "YES" : "NO",
        // );
        // if (session.accessToken) {
        //   console.log(
        //     "📤 [NextAuth Session] Token Start:",
        //     session.accessToken.substring(0, 20) + "...",
        //   );
        // }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// Export GET and POST handlers for App Router
export { handler as GET, handler as POST };
