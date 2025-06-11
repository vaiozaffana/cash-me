import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
      laravelToken?: string;
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      }
    interface Session {
        laravelToken?: string;
        accessToken?: string;
        user: {
            token: string;
            id: string;
            name: string;
            createdAt?: string;
        } & DefaultSession['user'];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
      accessToken?: string;
      laravelToken?: string;
    }
  }