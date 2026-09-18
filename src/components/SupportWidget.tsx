"use client"

import { useState, useMemo } from "react"
import { MessageCircle, X, Search, ChevronDown, ChevronRight, Send, AlertCircle, CheckCircle } from "lucide-react"

type SupportCategory =
  | "Candidate Submission"
  | "Candidate Status"
  | "Job Related"
  | "Interview Related"
  | "Payment / Commission"
  | "Bank Details"
  | "Account / Profile"
  | "Technical Issue"
  | "Other"

const CATEGORIES: SupportCategory[] = [
  "Candidate Submission",
  "Candidate Status",
  "Job Related",
  "Interview Related",
  "Payment / Commission",
  "Bank Details",
  "Account / Profile",
  "Technical Issue",
  "Other"
]

const FAQS = [
  {
    category: "Candidate Submission",
    question: "How do I submit a candidate?",
    answer: "You can submit a candidate by navigating to 'My Candidates' and clicking 'Add Candidate', or by going to 'Job Openings' and clicking 'Submit Candidate' directly on a specific job. You must provide their resume, email, and phone number."
  },
  {
    category: "Candidate Submission",
    question: "What happens if a candidate already exists?",
    answer: "Candidate uniqueness is strictly enforced by Email and Phone number across the entire ATS. If a candidate has already been submitted by another recruiter, you will not be able to submit them."
  },
  {
    category: "Candidate Status",
    question: "What happens to old candidates?",
    answer: "Candidates who have been in the system for more than 90 days are automatically archived. After 365 days, they are permanently deleted to comply with data retention policies."
  },
  {
    category: "Payment / Commission",
    question: "When do I get paid?",
    answer: "A placement record is generated when your candidate reaches the 'SELECTED' stage and an offered CTC is confirmed. However, recruiter payouts are only processed after the candidate has successfully 'JOINED'."
  },
  {
    category: "Bank Details",
    question: "How do I update my bank details?",
    answer: "Navigate to 'My Profile' and click the 'Edit Profile' button. In the modal, you will find a dedicated section to securely update your Bank Account Name, Number, Bank Name, IFSC code, and cancelled cheque."
  }
]

export default function SupportWidget({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<"faq" | "ticket">("faq")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null)

  const [category, setCategory] = useState<SupportCategory>("Candidate Submission")
  const [description, setDescription] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS
    const query = searchQuery.toLowerCase()
    return FAQS.filter(
      faq => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()

    if (description.length > 1000) {
      setError("Description must be 1000 characters or less.")
      return
    }

    if (!description.trim()) {
      setError("Please provide a description.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/support/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ category, description })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit ticket.")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[380px] h-[600px] max-h-[85vh] max-w-[calc(100vw-2rem)] bg-primary-lighter border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in flex flex-col">
      {/* Header */}
      <div className="bg-primary/80 border-b border-border p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-accent" />
          </div>
          <h3 className="font-semibold text-light text-base">Talentonus Support</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-primary transition-colors text-muted hover:text-light"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {view === "faq" && (
          <div className="p-5 flex flex-col h-full">
            <h4 className="text-xl font-bold text-light mb-4">Hi there 👋<br/>How can we help?</h4>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-primary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            <div className="flex-1">
              <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Popular Articles</h5>

              {filteredFaqs.length === 0 ? (
                <p className="text-sm text-muted">No matching articles found.</p>
              ) : (
                <div className="space-y-2">
                  {filteredFaqs.map((faq, index) => (
                    <div key={index} className="border border-border rounded-xl overflow-hidden bg-primary/30">
                      <button
                        onClick={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                        className="w-full text-left p-4 flex items-start justify-between hover:bg-primary/50 transition-colors"
                      >
                        <span className="text-sm font-medium text-light pr-4">{faq.question}</span>
                        {expandedFaqIndex === index ? (
                          <ChevronDown className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                        )}
                      </button>

                      {expandedFaqIndex === index && (
                        <div className="p-4 pt-0 text-sm text-muted border-t border-border/50 leading-relaxed bg-primary/20">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-border shrink-0">
              <p className="text-sm text-center text-muted mb-3">Still can&apos;t find an answer?</p>
              <button
                onClick={() => setView("ticket")}
                className="w-full flex items-center justify-center gap-2 bg-accent text-primary font-bold py-3 px-4 rounded-xl hover:bg-accent/90 transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)]"
              >
                Raise a Ticket
              </button>
            </div>
          </div>
        )}

        {view === "ticket" && (
          <div className="p-5 flex flex-col h-full">
            <button
              onClick={() => {
                setView("faq")
                setSuccess(false)
                setError("")
              }}
              className="flex items-center gap-1 text-sm text-muted hover:text-light transition-colors mb-4 inline-block w-fit"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to FAQs
            </button>

            {success ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <h4 className="text-xl font-bold text-light mb-2">Ticket Submitted</h4>
                <p className="text-sm text-muted mb-6">
                  We&apos;ve received your request and sent a confirmation to your email address.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-primary border border-border py-3 px-4 rounded-xl hover:border-accent hover:text-accent transition-colors font-medium text-sm text-light"
                >
                  Close Support
                </button>
              </div>
            ) : (
              <>
                <h4 className="text-xl font-bold text-light mb-1">Raise a Ticket</h4>
                <p className="text-sm text-muted mb-6">Describe your issue and we&apos;ll help you sort it out.</p>

                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-900/10 border border-red-900/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-100">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitTicket} className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SupportCategory)}
                      disabled={isSubmitting}
                      className="w-full bg-primary border border-border rounded-xl px-4 py-3 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-all appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider flex justify-between">
                      <span>Description</span>
                      <span className={description.length > 1000 ? "text-red-400" : ""}>{description.length} / 1000</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Please provide details about your issue..."
                      className="w-full flex-1 min-h-[150px] bg-primary border border-border rounded-xl px-4 py-3 text-sm text-light placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || description.length === 0 || description.length > 1000}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-primary font-bold py-3 px-4 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 shrink-0 shadow-[0_0_15px_rgba(170,255,0,0.2)] disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
