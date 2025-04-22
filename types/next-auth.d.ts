import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string; // Added role property
  }

  interface Session {
    user?: User;
    accessToken?: string; // Add accessToken property
  }
}
