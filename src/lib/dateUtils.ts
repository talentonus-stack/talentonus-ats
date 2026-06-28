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

export function formatLastLogin(dateInput: Date | string | null): string {
  if (!dateInput) return "Never";

  const d = new Date(dateInput);
  const now = new Date();

  const isToday = d.getDate() === now.getDate() &&
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.getDate() === yesterday.getDate() &&
                      d.getMonth() === yesterday.getMonth() &&
                      d.getFullYear() === yesterday.getFullYear();

  const timeString = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Today, ${timeString}`;
  } else if (isYesterday) {
    return `Yesterday, ${timeString}`;
  } else {
    const dateString = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${dateString}, ${timeString}`;
  }
}

export function formatCreatedDate(dateInput: Date | string | null): string {
  if (!dateInput) return "Unknown";
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
