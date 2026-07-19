"use client"

import { useFormStatus } from "react-dom"
import React from "react"

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string
  isLoading?: boolean // Optional override for client components that manage their own state
}

export default function SubmitButton({
  children,
  loadingText = "Loading...",
  isLoading: explicitIsLoading,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const isLoading = explicitIsLoading !== undefined ? explicitIsLoading : pending

  // Default premium class styling if none provided, matching ATS design language
  const defaultClass = "rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary hover:bg-accent-hover hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
  const appliedClass = className || defaultClass

  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={appliedClass}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
