import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function calculateGitHubScore(stats: {
  commits: number;
  contributions: number;
  codeQuality: number;
}) {
  const { commits, contributions, codeQuality } = stats;
  const commitScore = Math.min(commits / 1000, 1) * 40;
  const contributionScore = Math.min(contributions / 500, 1) * 30;
  const qualityScore = (codeQuality / 100) * 30;
  
  return Math.round(commitScore + contributionScore + qualityScore);
}