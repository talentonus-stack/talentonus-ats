import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import LayoutWrapper from "./LayoutWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ATS System",
  description: "Applicant Tracking System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen bg-primary text-light">
            <LayoutWrapper>{children}</LayoutWrapper>
          </div>
        </Providers>
      </body>
    </html>
  )
}
