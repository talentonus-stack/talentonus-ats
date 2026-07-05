cat << 'PATCH' > fix.patch
--- src/app/recruiter/jobs/JobListingClient.tsx
+++ src/app/recruiter/jobs/JobListingClient.tsx
@@ -197,6 +197,10 @@
                   <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Working Days</span>
                   <p className="text-sm font-semibold text-white">{selectedJob.workingDays || "N/A"}</p>
                 </div>
+                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
+                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Working Hours</span>
+                  <p className="text-sm font-semibold text-white">{(selectedJob as any).company?.workingHours || "N/A"}</p>
+                </div>
                 <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                   <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Industry</span>
                   <p className="text-sm font-semibold text-white truncate" title={selectedJob.industry || "N/A"}>{selectedJob.industry || "N/A"}</p>
@@ -204,7 +208,7 @@
-                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors sm:col-span-2">
+                <div className="bg-primary-lighter p-3 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
                   <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Gender Preference</span>
                   <p className="text-sm font-semibold text-white">{selectedJob.gender}</p>
                 </div>
PATCH
patch -p0 < fix.patch || true
sed -i 's/transition-colors sm:col-span-2/transition-colors/' src/app/recruiter/jobs/JobListingClient.tsx
