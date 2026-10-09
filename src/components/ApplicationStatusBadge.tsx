import React from 'react';
import { ApplicationStatus } from '@prisma/client';

const statusColorMapping: Record<ApplicationStatus | string, string> = {
  SUBMITTED: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  SCREENING: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  L1_SCHEDULED: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  L1_CLEARED: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  L2_SCHEDULED: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  L2_CLEARED: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  FINAL_ROUND_SCHEDULED: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  SELECTED: 'bg-green-500/15 text-green-400 border border-green-500/30',
  JOINED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  REJECTED: 'bg-red-500/15 text-red-400 border border-red-500/30',
  BACKED_OUT: 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
};

const formatStatus = (status: string) => {
  if (status === 'L1_SCHEDULED') return 'L1 SCHEDULED';
  if (status === 'L2_SCHEDULED') return 'L2 SCHEDULED';
  if (status === 'FINAL_ROUND_SCHEDULED') return 'FINAL ROUND SCHEDULED';
  return status.replace(/_/g, ' ');
};

export default function ApplicationStatusBadge({ status, label, className = "" }: { status: ApplicationStatus | string, label?: string, className?: string }) {
  const colorClass = statusColorMapping[status] || 'bg-gray-500/15 text-gray-400 border border-gray-500/30';
  const displayText = label || formatStatus(status);

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase truncate ${colorClass} ${className}`}
      title={displayText}
    >
      {displayText}
    </span>
  );
}
