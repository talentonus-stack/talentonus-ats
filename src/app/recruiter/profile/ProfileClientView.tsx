"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Mail, Phone, MapPin, Calendar, TrendingUp, DollarSign, FileText, Settings, Lock, Edit3, X, ShieldAlert } from "lucide-react"

export default function ProfileClientView({ recruiter, stats }: { recruiter: any, stats: any }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: recruiter.name || "",
    location: recruiter.location || "",
    mobile: recruiter.mobile || "",
    notes: recruiter.notes || "",
  })

  useEffect(() => {
    if (isEditModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isEditModalOpen]);

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveMessage("")

    try {
      const res = await fetch("/api/recruiter/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          mobile: formData.mobile
        })
      })

      if (!res.ok) throw new Error("Failed to save profile")

      setSaveMessage("Profile saved successfully!")
      setTimeout(() => {
        setIsEditModalOpen(false)
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      setSaveMessage(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotes = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/recruiter/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: formData.notes })
      })
      if (res.ok) alert("Notes saved successfully!")
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6 pb-12">

      {/* Header Profile Section */}
      <div className="bg-primary-lighter rounded-2xl border border-border p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary via-accent/5 to-primary border-b border-border/50"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end pt-12">

          {/* Avatar */}
          <div className="h-32 w-32 rounded-2xl bg-primary border-2 border-border shadow-2xl flex items-center justify-center shrink-0 relative overflow-hidden">
             <span className="text-5xl font-black text-light opacity-50">{recruiter.name?.charAt(0) || "R"}</span>
             <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(170,255,0,0.1)] rounded-2xl"></div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
             <div className="flex items-center justify-between">
               <div>
                 <h1 className="text-3xl font-bold text-light">{recruiter.name}</h1>
                 <p className="text-accent font-medium mt-1">Senior Technical Recruiter</p>
               </div>
               <div className="flex items-center gap-4">
                 <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase border ${recruiter.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                   {recruiter.status}
                 </span>
                 <button
                   onClick={() => setIsEditModalOpen(true)}
                   className="flex items-center gap-2 bg-primary border border-border text-xs font-bold text-light px-4 py-2 rounded-lg hover:text-accent hover:border-accent transition-colors"
                 >
                   <Edit3 className="w-4 h-4" /> Edit Profile
                 </button>
               </div>
             </div>

             <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted">
               <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {recruiter.email}</div>
               {recruiter.mobile && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {recruiter.mobile}</div>}
               <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {recruiter.location || "Remote"}</div>
               <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined {new Date(recruiter.createdAt).toLocaleDateString()}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Placement Earnings Center (Top Row) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/5 blur-xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Total Placements</span>
          <span className="text-2xl font-black text-light">{stats.totalPlacements}</span>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/5 blur-xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Revenue Generated</span>
          <span className="text-2xl font-black text-light">₹{(stats.revenueGenerated || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/10 blur-xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Commission Earned</span>
          <span className="text-2xl font-black text-accent">₹{(stats.commissionEarned || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-green-500/5 blur-xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Commission Received (Last 30 Days)</span>
          <span className="text-2xl font-black text-green-400">₹{(stats.commissionReceived || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-primary-lighter rounded-2xl border border-border p-5 shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-500/5 blur-xl pointer-events-none"></div>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Total Lifetime Earned</span>
          <span className="text-2xl font-black text-purple-400">₹{(stats.totalLifetimeEarned || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">


          {/* Commercial & Payment Terms */}
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg mb-6">
            <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
              <FileText className="w-4 h-4 text-accent" /> Commercial Agreement Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Commission %</span>
                <span className="text-sm font-bold text-accent">{recruiter.commissionPercentage || 0}%</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Payment Terms</span>
                <span className="text-sm font-bold text-light">{recruiter.paymentTermsDays ? `${recruiter.paymentTermsDays} Days` : 'Not Set'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Release Condition</span>
                <span className="text-sm font-medium text-light">{recruiter.paymentReleaseCondition || 'Not Set'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Recruiter Type</span>
                <span className="text-sm font-medium text-light">{recruiter.recruiterType || 'Not Set'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Agreement Signed</span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${recruiter.agreementSigned ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                  {recruiter.agreementSigned ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Agreement Date</span>
                <span className="text-sm font-medium text-light">{recruiter.agreementDate ? new Date(recruiter.agreementDate).toLocaleDateString() : 'Not Set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Expiry Date</span>
                <span className="text-sm font-medium text-light">{recruiter.agreementExpiryDate ? new Date(recruiter.agreementExpiryDate).toLocaleDateString() : 'Not Set'}</span>
              </div>

              {recruiter.agreementExpiryDate && new Date(recruiter.agreementExpiryDate) < new Date(new Date().setDate(new Date().getDate() + 30)) && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                  <p className="text-xs font-bold text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {new Date(recruiter.agreementExpiryDate) < new Date() ? 'Agreement Expired' : 'Agreement expiring within 30 days'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Placement Statistics */}
          <div className="bg-primary-lighter rounded-2xl border border-border p-6 shadow-lg">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
               <TrendingUp className="w-4 h-4 text-accent" /> Placement Statistics
             </h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center bg-primary/30 p-3 rounded-lg border border-border/50">
                 <span className="text-sm font-medium text-muted">Candidates Submitted</span>
                 <span className="text-sm font-bold text-light">{stats.totalSubmitted}</span>
               </div>
               <div className="flex justify-between items-center bg-primary/30 p-3 rounded-lg border border-border/50">
                 <span className="text-sm font-medium text-muted">Candidates Interviewed</span>
                 <span className="text-sm font-bold text-light">{stats.interviewed}</span>
               </div>
               <div className="flex justify-between items-center bg-primary/30 p-3 rounded-lg border border-border/50">
                 <span className="text-sm font-medium text-muted">Candidates Selected</span>
                 <span className="text-sm font-bold text-accent">{stats.selected}</span>
               </div>
               <div className="flex justify-between items-center bg-primary/30 p-3 rounded-lg border border-border/50">
                 <span className="text-sm font-medium text-muted">Candidates Joined</span>
                 <span className="text-sm font-bold text-green-400">{stats.joined}</span>
               </div>
               <div className="pt-2 border-t border-border">
                 <div className="flex justify-between items-center p-2">
                   <span className="text-xs font-bold text-muted uppercase">Selection Ratio</span>
                   <span className="text-xs font-bold text-light">{stats.selectionRatio}%</span>
                 </div>
                 <div className="flex justify-between items-center p-2">
                   <span className="text-xs font-bold text-muted uppercase">Joining Ratio</span>
                   <span className="text-xs font-bold text-light">{stats.joiningRatio}%</span>
                 </div>
               </div>
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Account Settings */}
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
             <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-border pb-3">
               <Settings className="w-4 h-4 text-accent" /> Account Settings
             </h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <span className="text-xs font-medium text-muted">Recruiter ID</span>
                 <p className="text-sm font-bold text-light mt-1 flex items-center gap-2">
                   {recruiter.id.substring(0,8)}...
                 </p>
               </div>
               <div>
                 <span className="text-xs font-medium text-muted">Member Since</span>
                 <p className="text-sm font-bold text-light mt-1">{new Date(recruiter.createdAt).toLocaleDateString()}</p>
               </div>
               <div>
                 <span className="text-xs font-medium text-muted">Last Login</span>
                 <p className="text-sm font-bold text-light mt-1">Today</p>
               </div>
               <div>
                 <span className="text-xs font-medium text-muted">Account Status</span>
                 <p className="mt-1">
                   <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${recruiter.status === 'ACTIVE' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                     {recruiter.status}
                   </span>
                 </p>
               </div>
               <div>
                 <span className="text-xs font-medium text-muted">Email Verified</span>
                 <p className="text-sm font-bold text-green-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Yes</p>
               </div>
               <div>
                 <span className="text-xs font-medium text-muted">Mobile Verified</span>
                 <p className="text-sm font-bold text-green-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Yes</p>
               </div>
             </div>
          </div>

          {/* Placement Commission History */}
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-sm font-bold text-light uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" /> Placement Commission History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border/50">
                <thead className="bg-primary/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Position</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-primary-lighter">
                  {stats.commissionHistory.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-primary/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-light font-bold">{item.candidateName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{item.company}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">{item.position}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-muted">{item.placementDate}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-accent">₹{(item.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${item.status === 'PAID' ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-orange-900/20 text-orange-400 border-orange-800/30'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.commissionHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-sm text-muted text-center">No successful placements yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Personal Notes */}
          <div className="bg-primary-lighter rounded-2xl border border-border shadow-lg p-6">
             <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
               <h3 className="text-sm font-bold text-light uppercase tracking-wider flex items-center gap-2">
                 <Lock className="w-4 h-4 text-accent" /> Private Notes
               </h3>
               <span className="text-[10px] text-muted uppercase tracking-widest font-bold bg-primary px-2 py-1 rounded-md border border-border">Confidential</span>
             </div>
             <textarea
               name="notes"
               value={formData.notes}
               onChange={handleInputChange}
               className="w-full h-32 bg-primary border border-border rounded-xl p-4 text-sm text-light placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none custom-scrollbar"
               placeholder="Write your private notes, reminders, or candidate follow-up thoughts here..."
             />
             <div className="mt-3 flex justify-end">
               <button
                 onClick={handleSaveNotes}
                 disabled={isSaving}
                 className="bg-primary border border-border text-xs font-bold text-light px-4 py-2 rounded-lg hover:text-accent hover:border-accent transition-colors disabled:opacity-50"
               >
                 {isSaving ? "Saving..." : "Save Notes"}
               </button>
             </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-primary-lighter border border-border rounded-2xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-light transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6 border-b border-border shrink-0">
              <h2 className="text-xl font-bold text-light">Edit Profile</h2>
              <p className="text-sm text-muted mt-1">Update your personal and contact information.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

              <div>
                <h3 className="text-sm font-bold text-light uppercase tracking-wider mb-4 border-b border-border pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Full Name</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleInputChange}
                      className="w-full bg-primary border border-border rounded-lg p-2.5 text-sm text-light focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Designation</label>
                    <input
                      type="text" value="Senior Technical Recruiter" disabled
                      className="w-full bg-primary/50 border border-border/50 rounded-lg p-2.5 text-sm text-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Email Address</label>
                    <input
                      type="email" value={recruiter.email} disabled
                      className="w-full bg-primary/50 border border-border/50 rounded-lg p-2.5 text-sm text-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Mobile Number</label>
                    <input
                      type="text" name="mobile" value={formData.mobile} onChange={handleInputChange}
                      className="w-full bg-primary border border-border rounded-lg p-2.5 text-sm text-light focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted mb-1">Location</label>
                    <input
                      type="text" name="location" value={formData.location} onChange={handleInputChange}
                      className="w-full bg-primary border border-border rounded-lg p-2.5 text-sm text-light focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {saveMessage && (
                <div className={`p-3 rounded-lg text-sm font-bold text-center ${saveMessage.includes('successfully') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                  {saveMessage}
                </div>
              )}

            </form>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-primary-lighter/50 rounded-b-2xl shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-muted hover:text-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-accent text-primary hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
