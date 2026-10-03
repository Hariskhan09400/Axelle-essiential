export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function formatRelativeTime(timestamp: string): string {
  const time = new Date(timestamp).getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
