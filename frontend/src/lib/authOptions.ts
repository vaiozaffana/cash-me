import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const user = response.data;

          // Simpan token Laravel ke localStorage (client-side only)
          if (user?.token && typeof window !== "undefined") {
            localStorage.setItem("laravelToken", user.token);
          }

          return user && user.id ? user : null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      console.log("🔥 JWT CALLBACK DIPANGGIL");

      // Handle Google login → exchange Google id_token to Laravel token
      if (account?.provider === "google" && account.id_token) {
        try {
          console.log("🔁 Menukar token Google ke token Laravel...");

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google-exchange`,
            { token: account.id_token }
          );

          const laravelToken = response.data.token;
          console.log("✅ Laravel Token dari backend:", laravelToken);

          // Simpan di token JWT
          token.laravelToken = laravelToken;

          // Simpan juga di localStorage jika di client
          if (typeof window !== "undefined") {
            localStorage.setItem("laravelToken", laravelToken);
          }
        } catch (error) {
          console.error("❌ Gagal menukar token Google:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.laravelToken) {
        session.laravelToken = token.laravelToken;
      } else {
        console.warn("⚠️ Token.laravelToken tidak ditemukan di JWT token");
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
