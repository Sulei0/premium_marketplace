import { useState, useMemo } from "react";
import { cn } from "@/lib/index";

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
    /** Width for thumbnail generation (Supabase transform). Default: 400 */
    thumbnailWidth?: number;
    /** Height for thumbnail generation (Supabase transform). Default: 400 */
    thumbnailHeight?: number;
    /** Whether to generate optimized URL via Supabase transform. Default: true */
    useOptimization?: boolean;
}

/**
 * Optimized image component with:
 * - Supabase Storage thumbnail transforms (smaller file size)
 * - Skeleton loading animation
 * - Lazy loading built-in
 * - Fallback for errors
 * - WebP format via Supabase transforms
 */
export function OptimizedImage({
    src,
    alt,
    className,
    fallbackSrc = "/images/placeholder.webp",
    thumbnailWidth = 400,
    thumbnailHeight = 400,
    useOptimization = true,
}: OptimizedImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Generate optimized URL if the source is a Supabase Storage URL
    const optimizedSrc = useMemo(() => {
        if (!useOptimization || !src || error) return error ? fallbackSrc : src;

        // Check if it's a Supabase Storage URL
        const isSupabaseUrl = src.includes("supabase") && src.includes("/storage/");
        if (!isSupabaseUrl) return src;

        // Add transform parameters for Supabase Image Transformation
        const separator = src.includes("?") ? "&" : "?";
        return `${src}${separator}width=${thumbnailWidth}&height=${thumbnailHeight}&resize=cover&format=webp`;
    }, [src, thumbnailWidth, thumbnailHeight, useOptimization, error, fallbackSrc]);

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Skeleton */}
            {!loaded && (
                <div className="absolute inset-0 bg-muted/30 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
                </div>
            )}

            <img
                src={optimizedSrc}
                alt={alt}
                loading="lazy"
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => {
                    if (!error) {
                        setError(true);
                        setLoaded(true);
                    }
                }}
                className={cn(
                    "transition-opacity duration-500",
                    loaded ? "opacity-100" : "opacity-0",
                    className
                )}
            />
        </div>
    );
}
