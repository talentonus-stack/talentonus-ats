"use client"

export default function RecruiterInterviewsClient({ initialInterviews }: { initialInterviews: any[] }) {
  // Metrics
  const todayStart = new Date()
  todayStart.setHours(0,0,0,0)
  const todayEnd = new Date()
  todayEnd.setHours(23,59,59,999)

  const todayCount = initialInterviews.filter(i => {
    const d = new Date(i.interviewDate);
    return d >= todayStart && d <= todayEnd && i.status === 'SCHEDULED'
  }).length;

  const upcomingCount = initialInterviews.filter(i => new Date(i.interviewDate) > todayEnd && i.status === 'SCHEDULED').length;
  const completedCount = initialInterviews.filter(i => i.status === 'COMPLETED').length;
  const cancelledCount = initialInterviews.filter(i => i.status === 'CANCELLED').length;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto text-light">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-light">Interviews</h1>
        <p className="mt-2 text-sm text-muted">Track interviews for your submitted candidates.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-primary border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Today</p>
          <p className="text-2xl font-bold text-light mt-1">{todayCount}</p>
        </div>
        <div className="bg-primary border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Upcoming</p>
          <p className="text-2xl font-bold text-light mt-1">{upcomingCount}</p>
        </div>
        <div className="bg-primary border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Completed</p>
          <p className="text-2xl font-bold text-light mt-1">{completedCount}</p>
        </div>
        <div className="bg-primary border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Cancelled</p>
          <p className="text-2xl font-bold text-light mt-1">{cancelledCount}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-primary-lighter shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-border">
            <thead className="bg-primary-lighter/50">
              <tr>
                <th className="w-[20%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Candidate</th>
                <th className="w-[20%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Job</th>
                <th className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Round</th>
                <th className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Mode</th>
                <th className="w-[25%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date & Time</th>
                <th className="w-[15%] px-4 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-primary-lighter">
              {initialInterviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-primary/50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium truncate">{interview.candidate.firstName} {interview.candidate.lastName}</td>
                  <td className="px-4 py-4 text-sm text-muted truncate">{interview.job.title}</td>
                  <td className="px-4 py-4 text-sm font-bold text-accent">{interview.round.replace('_', ' ')}</td>
                  <td className="px-4 py-4 text-sm text-muted">{interview.mode}</td>
                  <td className="px-4 py-4 text-sm text-light">
                    {new Date(interview.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase leading-tight border truncate
                      ${interview.status === 'SCHEDULED' ? 'bg-blue-900/20 text-blue-400 border-blue-500/20' : ''}
                      ${interview.status === 'COMPLETED' ? 'bg-green-900/20 text-green-400 border-green-500/20' : ''}
                      ${interview.status === 'CANCELLED' ? 'bg-red-900/20 text-red-400 border-red-500/20' : ''}
                      ${interview.status === 'NO_SHOW' ? 'bg-orange-900/20 text-orange-400 border-orange-500/20' : ''}
                    `}>
                      {interview.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {initialInterviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-sm text-muted text-center">No interviews found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
