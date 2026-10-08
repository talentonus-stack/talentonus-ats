"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Clock, CheckCircle, AlertCircle, RefreshCcw } from "lucide-react";

type RequestStatus = "OPEN" | "RESOLVED";
type RequestPriority = "NORMAL" | "HIGH";

interface UpdateRequest {
  id: string;
  requestText: string;
  responseText: string | null;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: Date | string;
  resolvedAt: Date | string | null;
  requestedBy: { name: string | null };
  recruiter: { name: string | null };
  resolvedBy: { name: string | null } | null;
}

export default function CandidateUpdateRequestsClient({
  candidateId,
  requests,
}: {
  candidateId: string;
  requests: UpdateRequest[];
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [requestText, setRequestText] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("NORMAL");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim()) {
      setError("Please enter the request details.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/candidate-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          requestText: requestText.trim(),
          priority,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create request.");
      }

      // Success
      setIsModalOpen(false);
      setRequestText("");
      setPriority("NORMAL");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-primary-lighter rounded-lg shadow-sm border border-border p-6 mt-6 md:col-span-2">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
        <h2 className="text-lg font-semibold text-light">Candidate Update Requests</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary border border-border text-light px-4 py-2 rounded-md hover:border-accent hover:text-accent transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary"
        >
          <PlusCircle className="w-4 h-4" />
          Request Update
        </button>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-8 bg-primary/30 rounded-lg border border-border/50">
            <RefreshCcw className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium text-light">No update requests yet.</p>
            <p className="text-xs text-muted mt-1">Use "Request Update" when additional information or action is required from the recruiter.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-primary border border-border rounded-lg p-5 hover:border-accent/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">Update Request</span>
                    {req.priority === "HIGH" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-900/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-red-400 border border-red-800/30">
                        <AlertCircle className="w-3 h-3" /> High
                      </span>
                    )}
                    {req.priority === "NORMAL" && (
                      <span className="inline-flex items-center rounded-full bg-primary-lighter px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-muted border border-border">
                        Normal
                      </span>
                    )}
                    {req.status === "OPEN" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-900/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-orange-400 border border-orange-800/30">
                        <Clock className="w-3 h-3" /> Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-accent border border-accent/20">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-light whitespace-pre-wrap">{req.requestText}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted border-t border-border/50 pt-3">
                <p>Requested by: <span className="font-medium text-light">{req.requestedBy.name || 'Admin'}</span></p>
                <p>Assigned to: <span className="font-medium text-light">{req.recruiter.name || 'Unknown'}</span></p>
                <p>{new Date(req.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>

              {req.status === "RESOLVED" && (
                <div className="mt-4 bg-primary-lighter rounded-md p-4 border border-border">
                  <span className="block text-xs font-semibold text-muted uppercase mb-1">Recruiter Response</span>
                  <p className="text-sm text-light whitespace-pre-wrap italic">"{req.responseText}"</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted mt-3">
                    <p>Resolved by: <span className="font-medium text-light">{req.resolvedBy?.name || 'Recruiter'}</span></p>
                    <p>Resolved: {req.resolvedAt ? new Date(req.resolvedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
          <div className="bg-primary-lighter rounded-2xl shadow-2xl border border-border w-full max-w-lg flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border bg-primary/30">
              <h2 className="text-lg font-bold text-light">Request Candidate Update</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="text-muted hover:text-light transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-sm">{error}</div>}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Request Details</label>
                  <textarea
                    required
                    rows={4}
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="e.g. Please confirm the candidate's current notice period and expected salary."
                    className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light placeholder-muted/50 focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200 resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RequestPriority)}
                    className="block w-full rounded-lg bg-primary border border-border px-4 py-3 text-sm text-light focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-light bg-primary hover:bg-border transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-accent text-sm font-bold text-primary hover:bg-accent-hover transition-colors shadow-[0_0_15px_rgba(170,255,0,0.2)] hover:shadow-[0_0_20px_rgba(170,255,0,0.4)] disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
