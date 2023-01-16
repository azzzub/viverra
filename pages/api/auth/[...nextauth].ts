// External
import NextAuth, { AuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcrypt";
const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials, req) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        try {
          const user = await prisma.user.findFirst({
            where: {
              username,
            },
          });

          if (!user) {
            throw new Error("username doesn't exist");
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (isMatch) {
            return {
              id: user?.id,
              username: user?.username,
              role: user?.role,
            };
          } else {
            throw new Error("recheck your username and password");
          }
        } catch (error: any) {
          console.error(error);
          throw new Error(error?.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/new-user",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      user && (token.user = user);
      return token;
    },
    session: async ({ session, token }: any) => {
      session.user = token.user;
      return session;
    },
  },
};
export default NextAuth(authOptions);
