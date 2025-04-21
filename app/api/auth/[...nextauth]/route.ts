import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

// Mock admin account for testing
const MOCK_ADMIN = {
  username: "admin",
  password: "admin123",
  id: "1",
  email: "admin@example.com",
  access_token: "mock-access-token"
};

// Mock users for testing
const MOCK_USERS = [
  {
    username: "admin",
    password: "admin123",
    id: "1",
    email: "admin@example.com",
    access_token: "mock-access-token"
  },
  {
    username: "user",
    password: "user123",
    id: "2",
    email: "user@example.com",
    access_token: "mock-user-token"
  }
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // First try to authenticate with backend
          try {
            const response = await fetch("http://127.0.0.1:5000/users/login", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials?.username, // Use email instead of username
                password: credentials?.password,
              }),
            });
            console.log('Response from backend:', response);
            if (response.ok) {
              const user = await response.json();
              console.log('User from backend:', user);
              return {
                id: credentials?.username || "", // Ensure id is always a string
                name: credentials?.username,
                email: credentials?.username, // Assuming email is the same as username
                accessToken: user.token, // Use token from backend response
              };
            }
          } catch (backendError) {
            console.log('Backend not available, using mock data');
          }

          // If backend fails or returns error, use mock data
          const mockUser = MOCK_USERS.find(
            user => user.username === credentials?.username && 
                   user.password === credentials?.password
          );

          if (mockUser) {
            return {
              id: mockUser.id || "", // Ensure id is always a string
              name: mockUser.username,
              email: mockUser.email,
              accessToken: mockUser.access_token,
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };