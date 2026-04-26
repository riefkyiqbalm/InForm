// website/src/types/next-auth.d.ts
import NextAuth from "next-auth";
import { Role } from "@sharedUI/types";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
      contact?: string | null;
      institution?: string | null;
    };
  }

  interface JWT {
    accessToken?: string;
    sub?: string;
    role?: Role;
    contact?: string | null;
    institution?: string | null;
  }
}