/**
 * Calculate reading time and word count for content
 * Based on average reading speed of 200 words per minute
 */

export interface ReadingStats {
  minutes: number;
  words: number;
  formattedTime: string; // e.g., "5 min read"
}

/**
 * Calculate reading time from HTML content
 */
export function calculateReadingTime(htmlContent: string): ReadingStats {
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, ' ');
  
  // Remove extra whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Count words
  const words = cleanText.split(/\s+/).filter(word => word.length > 0).length;
  
  // Calculate reading time (200 words per minute)
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  // Format time
  let formattedTime: string;
  if (minutes < 1) {
    formattedTime = '< 1 min read';
  } else if (minutes === 1) {
    formattedTime = '1 min read';
  } else {
    formattedTime = `${minutes} min read`;
  }
  
  return {
    minutes,
    words,
    formattedTime,
  };
}

/**
 * Get word count only
 */
export function getWordCount(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]*>/g, ' ');
  const cleanText = text.replace(/\s+/g, ' ').trim();
  return cleanText.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimate reading progress percentage
 */
export function calculateReadingProgress(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
): number {
  if (scrollHeight <= clientHeight) return 100;
  
  const scrollableHeight = scrollHeight - clientHeight;
  const progress = (scrollTop / scrollableHeight) * 100;
  
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Format word count for display
 */
export function formatWordCount(words: number): string {
  if (words < 1000) {
    return `${words} words`;
  }
  
  const thousands = (words / 1000).toFixed(1);
  return `${thousands}k words`;
}
