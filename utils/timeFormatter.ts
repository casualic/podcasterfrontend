/**
 * Format milliseconds to MM:SS format
 * @param ms - Time in milliseconds
 * @returns Formatted time string
 */
export const formatTime = (ms: number): string => {
  if (!ms) return '00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format duration in minutes to a readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return 'Less than 1 min';
  return `${minutes} min`;
};