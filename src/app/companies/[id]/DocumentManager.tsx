"use client"
import { useState, useRef } from "react"
import { FileOutput, Trash2, Download, UploadCloud, Loader2 } from "lucide-react"

export default function DocumentManager({ companyId, initialDocuments }: { companyId: string, initialDocuments: any[] }) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState("CONTRACT")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("bucket", "resumes") // Reuse resumes bucket or specify another

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Save to database
      const dbRes = await fetch(`/api/companies/${companyId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fileName,
          fileUrl: data.filePath,
          category,
        })
      })

      const dbData = await dbRes.json()
      if (dbData.error) throw new Error(dbData.error)

      setDocuments([dbData, ...documents])
    } catch (err: any) {
      alert("Failed to upload document: " + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const res = await fetch(`/api/companies/${companyId}/documents?id=${docId}`, {
        method: "DELETE"
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setDocuments(documents.filter(d => d.id !== docId))
    } catch (err: any) {
      alert("Failed to delete document: " + err.message)
    }
  }

  return (
    <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
        <h3 className="text-lg font-bold text-light flex items-center gap-2">
          <FileOutput className="w-5 h-5 text-accent" /> Client Documents
        </h3>

        <div className="flex items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs rounded-lg bg-primary border border-border px-3 py-2 text-light focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value="CONTRACT">Contract</option>
            <option value="NDA">NDA</option>
            <option value="FEE_AGREEMENT">Fee Agreement</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-primary hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {documents.length === 0 ? (
          <p className="text-sm text-muted text-center py-6 border border-dashed border-border rounded-lg bg-primary/20">No documents uploaded yet.</p>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-primary hover:border-accent/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-lighter border border-border flex items-center justify-center">
                  <FileOutput className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-light hover:text-accent hover:underline">
                    {doc.name}
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider bg-primary-lighter px-2 py-0.5 rounded border border-border">
                      {doc.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-primary-lighter text-muted hover:text-accent hover:bg-primary transition-colors border border-transparent hover:border-accent/30"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded-lg bg-primary-lighter text-muted hover:text-red-400 hover:bg-red-900/10 transition-colors border border-transparent hover:border-red-900/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
