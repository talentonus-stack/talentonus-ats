export function getStatusColorClass(status: string) {
  switch (status) {
    case 'SUBMITTED':
    case 'NEW':
      return 'bg-blue-900/20 text-blue-400 border-blue-800/30'
    case 'SCREENING':
      return 'bg-amber-900/20 text-amber-400 border-amber-800/30'
    case 'L1_SCHEDULED':
    case 'L2_SCHEDULED':
      return 'bg-purple-900/20 text-purple-400 border-purple-800/30'
    case 'L1_CLEARED':
    case 'L2_CLEARED':
      return 'bg-cyan-900/20 text-cyan-400 border-cyan-800/30'
    case 'FINAL_ROUND_SCHEDULED':
      return 'bg-orange-900/20 text-orange-400 border-orange-800/30'
    case 'SELECTED':
      return 'bg-green-900/20 text-green-400 border-green-800/30'
    case 'REJECTED':
      return 'bg-red-900/20 text-red-400 border-red-800/30'
    case 'JOINED':
      return 'bg-teal-900/20 text-teal-400 border-teal-800/30'
    case 'BACKED_OUT':
      return 'bg-slate-800/50 text-slate-400 border-slate-700/50'
    default:
      return 'bg-border text-muted border-border'
  }
}

export function formatStatusText(status: string) {
  if (status === "L1_SCHEDULED") return "L1 Schedule"
  if (status === "L2_SCHEDULED") return "L2 Schedule"
  if (status === "FINAL_ROUND_SCHEDULED") return "Final Round Schedule"
  return status.replace(/_/g, ' ')
}
