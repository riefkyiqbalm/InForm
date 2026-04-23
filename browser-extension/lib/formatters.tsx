/**
 * Text formatting utilities
 * Extracted from components: MessageBubble, ChatArea, etc.
 */

/**
 * Formats text with markdown-style bold (**text**) and converts newlines to React elements
 * @param text - Raw text with ** for bold and \n for newlines
 * @returns Array of React nodes with formatted text
 */
export function formatText(text: string): React.ReactNode[] {
  return text.split("\n").map((line, li, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={li}>
        {parts.map((p, pi) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={pi}>{p.slice(2, -2)}</strong>
          ) : (
            <span key={pi}>{p}</span>
          )
        )}
        {li < arr.length - 1 && <br />}
      </span>
    );
  });
}

/**
 * Converts ISO 8601 timestamp to localized time string (HH:mm)
 * @param iso - ISO 8601 formatted date string
 * @returns Formatted time string in locale format (e.g., "14:30")
 */
export function formatTimeFromISO(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a Date object to localized time string (HH:mm)
 * @param date - Date object
 * @returns Formatted time string in locale format (e.g., "14:30")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncates text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if exceeds max length
 */
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

/**
 * Formats user name to initials for avatar display
 * @param name - Full user name
 * @returns Formatted initials (e.g., "JD" from "John Doe")
 */
export function formatUserInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Capitalizes first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats number with thousands separator
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("id-ID");
}

/**
 * Formats date to readable string (e.g., "12 April 2026")
 * @param date - Date object or ISO string
 * @returns Formatted date string
 */
export function formatDateReadable(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
