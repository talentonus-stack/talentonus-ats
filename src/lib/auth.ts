import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        // Check if it's an email or mobile
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { mobile: credentials.email }
            ]
          }
        })

        if (!user || user.status !== 'ACTIVE') {
          return null
        }

        // Logic for Admin standard login
        if (credentials.password && user.password) {
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (isPasswordValid) {
            return { id: user.id, email: user.email, name: user.name, role: user.role }
          }
        }

        // Logic for Recruiter OTP login
        if (credentials.otp && user.otp === credentials.otp) {
          // Verify expiry
          if (user.otpExpiry && new Date() < user.otpExpiry) {
            // clear OTP
            await prisma.user.update({
              where: { id: user.id },
              data: { otp: null, otpExpiry: null }
            })
            return { id: user.id, email: user.email, name: user.name, role: user.role }
          }
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
