import NextAuth from "next-auth";
import { Role } from "@sharedUI/types";

declare module "next-auth" {
  interface Session {
    // The Custom JWT compatible with getUserFromToken()
    accessToken?: string; 
    // The raw Google Access Token (optional, for Google APIs)
    googleAccessToken?: string;
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
    id: string;
    customAccessToken?: string;
    accessToken?: string; // Google's token
    role?: Role;
    contact?: string | null;
    institution?: string | null;
  }
}