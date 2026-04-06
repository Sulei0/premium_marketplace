import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOptimizedImageUrl(
  url: string | null | undefined,
  width: number = 400,
  height?: number,
  quality: number = 75
): string {
  if (!url) return '';

  // Images are already compressed locally before upload, and Free Tier doesn't support transformations
  // so we return the original URL.
  return url;
}

/** Optimized URL for avatars (small, square) */
export function getOptimizedAvatarUrl(url: string | null | undefined): string {
  return getOptimizedImageUrl(url, 100, 100, 80);
}

/** Optimized URL for product thumbnails in grids */
export function getOptimizedThumbnailUrl(url: string | null | undefined): string {
  return getOptimizedImageUrl(url, 400, 500, 75);
}

/** Optimized URL for product detail (larger) */
export function getOptimizedDetailUrl(url: string | null | undefined): string {
  return getOptimizedImageUrl(url, 800, undefined, 82);
}
