/**
 * Utility functions for text formatting and truncation
 */

/**
 * Truncates text to approximately 7 lines using CSS line-clamp
 * This ensures consistent card heights across the application
 */
export function truncateToLines(text: string, maxLines: number = 7): string {
  if (!text || text.length === 0) {
    return 'No description available';
  }
  
  // Split text into words
  const words = text.split(' ');
  
  // Approximate characters per line (adjust based on your card width)
  // Assuming average 12-15 words per line for the card width
  const wordsPerLine = 12;
  const maxWords = maxLines * wordsPerLine;
  
  if (words.length <= maxWords) {
    return text;
  }
  
  // Truncate to maxWords and add ellipsis
  const truncated = words.slice(0, maxWords).join(' ');
  return truncated + '...';
}

/**
 * Formats text for display in contract cards
 * Ensures consistent formatting and truncation
 */
export function formatContractDescription(description?: string): string {
  const text = description || 'No description available';
  return truncateToLines(text, 7);
}

/**
 * CSS classes for consistent card styling
 */
export const CARD_STYLES = {
  container: "bg-white rounded-lg shadow border border-slate-200 relative h-96 flex flex-col",
  content: "p-6 flex-1 flex flex-col",
  description: "text-sm text-slate-600 mb-4 flex-1 line-clamp-7",
  actions: "flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200 space-y-3 sm:space-y-0 mt-auto"
} as const;
