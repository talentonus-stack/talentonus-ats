import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import LayoutWrapper from "./LayoutWrapper"
import GlobalLoadingProvider from "@/components/GlobalLoading"

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
          <GlobalLoadingProvider>
            <div className="flex h-screen bg-primary text-light">
              <LayoutWrapper>{children}</LayoutWrapper>
            </div>
          </GlobalLoadingProvider>
        </Providers>
      </body>
    </html>
  )
}
