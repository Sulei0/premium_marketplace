import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOptimizedImageUrl(url: string | null | undefined, width: number = 150): string {
  if (!url) return '';

  // Only optimize Supabase storage URLs
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    // Check if URL already has query params
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&format=webp&quality=80`;
  }

  return url;
}
