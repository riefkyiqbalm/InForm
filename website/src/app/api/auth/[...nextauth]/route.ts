import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { Role } from "@sharedUI/types";
import { AUTH_SECRET } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      try {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, name: true, image: true },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "",
              image: user.image || "",
              password: Math.random().toString(36).slice(-10),
              role: "USER" as Role,
            },
          });
        }

        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            name: user.name || dbUser.name,
            image: user.image || dbUser.image,
          },
        });

        user.id = dbUser.id.toString();
        return true;
      } catch (error) {
        console.error("Google signIn error:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.customAccessToken = jwt.sign(
          { userId: user.id, email: token.email },
          AUTH_SECRET,
          { expiresIn: "7d" },
        );
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
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
