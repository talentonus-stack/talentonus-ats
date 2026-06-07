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
        console.log("=== AUTH TRACE START ===")
        console.log("Email provided:", credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log("Returning null at: Missing credentials (email or password not provided)")
          return null
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
        } catch (e) {
          console.log("Database lookup failed entirely:", e)
          return null
        }

        console.log("User found by email? (yes/no):", user ? "yes" : "no")

        if (!user) {
          console.log("Returning null at: User not found in database")
          return null
        }

        console.log("User email:", user.email)
        console.log("User role:", user.role)
        console.log("User status:", user.status)

        if (user.status !== 'ACTIVE') {
          console.log("Returning null at: User status is not ACTIVE (it is " + user.status + ")")
          return null
        }

        if (!user.password) {
          console.log("Returning null at: User has no password set in database")
          return null
        }

        // Validate password for both Admin and Recruiter
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        console.log("bcrypt.compare(password, user.password) returned:", isPasswordValid)

        if (isPasswordValid) {
          console.log("Authentication SUCCESS. Returning user payload.")
          console.log("=== AUTH TRACE END ===")
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        }

        console.log("Returning null at: bcrypt.compare returned false (invalid password)")
        console.log("=== AUTH TRACE END ===")
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
