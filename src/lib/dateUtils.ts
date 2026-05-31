export function timeAgo(date: Date | string | null): string {
  if (!date) return 'Unknown';
  const time = new Date(date).getTime();
  const now = new Date().getTime();
  const diff = Math.floor((now - time) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return `${Math.floor(diff / 2592000)} months ago`;
}
