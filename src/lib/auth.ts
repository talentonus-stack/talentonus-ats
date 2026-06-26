import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || user.status !== 'ACTIVE' || !user.password) {
          return null
        }

        // Validate password for both Admin and Recruiter
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (isPasswordValid) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLogin: new Date() }
            })
          } catch (e) {
            console.error("Failed to update last login:", e)
          }
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        }

        return null
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session
    }
  },
  pages: { signIn: "/login" }
}
