"use client"

import { createContext, useContext, useState, useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Image from "next/image"

const GlobalLoadingContext = createContext({
  isLoading: false,
  setLoading: (loading: boolean) => {},
})

export const useGlobalLoading = () => useContext(GlobalLoadingContext)

function LoadingEvents({ setLoading }: { setLoading: (loading: boolean) => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setLoading(false)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")

      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href) return

      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return
      }

      if (href === pathname || href === pathname + searchParams.toString()) {
        return
      }

      setLoading(true)
    }

    document.addEventListener("click", handleAnchorClick, true)
    return () => {
      document.removeEventListener("click", handleAnchorClick, true)
    }
  }, [pathname, searchParams])

  return null
}

export default function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setLoading] = useState(false)

  return (
    <GlobalLoadingContext.Provider value={{ isLoading, setLoading }}>
      <Suspense fallback={null}>
        <LoadingEvents setLoading={setLoading} />
      </Suspense>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary/80 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center">
            <div className="mb-8 relative">
              <Image
                src="/logo.png"
                alt="Talentonus Logo"
                width={200}
                height={80}
                className="brightness-0 invert opacity-90 object-contain animate-pulse"
              />
            </div>

            <div className="relative flex items-center justify-center w-12 h-12 mb-4">
              <svg className="absolute w-full h-full text-accent animate-spin" viewBox="0 0 50 50">
                <circle className="opacity-25" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4"></circle>
                <circle className="opacity-75" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 150" strokeDashoffset="0"></circle>
              </svg>
            </div>

            <p className="text-light font-medium tracking-wide">Preparing your workspace...</p>
          </div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  )
}
