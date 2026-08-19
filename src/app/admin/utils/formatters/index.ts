/**
 * Number formatting utilities for admin UI
 */

/**
 * Format number in compact notation (e.g., 1.2K, 3.4M)
 */
export function compactFormat(value: number): string {
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  });

  return formatter.format(value);
}

/**
 * Format number with thousands separators and 2 decimal places
 */
export function standardFormat(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format timestamp as relative or absolute time
 */
export function formatMessageTime(timestamp: string): string {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - messageDate.getTime()) / (60 * 1000),
  );
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // For messages from today, show time
  if (diffInDays === 0) {
    // If less than 60 minutes ago, show "X min"
    if (diffInMinutes < 60) {
      return diffInMinutes === 0 ? "just now" : `${diffInMinutes}m`;
    }
    // Otherwise show time like "4:39 PM"
    return messageDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // For messages from this week, show day name
  if (diffInDays < 7) {
    return messageDate.toLocaleDateString("en-US", { weekday: "long" });
  }

  // For messages from this year, show date
  if (messageDate.getFullYear() === now.getFullYear()) {
    return messageDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  }

  // For older messages, show date with year
  return messageDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
