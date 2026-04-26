// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// ✅ Import the singleton instance instead of creating a new one
import { prisma } from "@/lib/prisma"; 
import { Role } from "@sharedUI/types";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create user with a random dummy password if schema requires it
            const randomPassword = crypto.randomBytes(32).toString("hex");
            
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                image: user.image!,
                role: "USER" as Role,
                password: randomPassword, 
              },
            });
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken as string;
        session.user.id = token.sub as string;
        // Fetch extra fields if needed
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.sub) },
          select: { role: true, contact: true, institution: true }
        });
        if (dbUser) {
          (session.user as any).role = dbUser.role;
          (session.user as any).contact = dbUser.contact;
          (session.user as any).institution = dbUser.institution;
        }
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
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