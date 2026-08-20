import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { mockUsers } from "@/lib/mockDb";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@dummy.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = mockUsers.find((u) => u.email === credentials.email && u.password === credentials.password);
        if (user) {
          return { id: user.id, name: user.name, email: user.email, image: user.image };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only_12345",
});

export { handler as GET, handler as POST };
