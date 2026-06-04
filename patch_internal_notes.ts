const fs = require('fs')

let content = fs.readFileSync('src/app/companies/[id]/page.tsx', 'utf8')

content = content.replace(
  `{isAdmin && company.notes && (
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted font-semibold uppercase mb-2 text-red-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Internal Notes (Admin Only)
                  </p>
                  <p className="text-sm text-light bg-primary p-3 rounded-lg border border-border whitespace-pre-wrap">{company.notes}</p>
                </div>
             )}`,
  `{isAdmin && company.notes && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Internal Client Notes</p>
                  </div>
                  <div className="bg-primary/50 p-4 rounded-xl border border-red-900/30">
                    <p className="text-sm text-light/90 whitespace-pre-wrap leading-relaxed">{company.notes}</p>
                  </div>
                </div>
             )}`
)

fs.writeFileSync('src/app/companies/[id]/page.tsx', content)
