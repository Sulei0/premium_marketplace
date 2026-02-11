import { useState } from "react";
import { cn } from "@/lib/index";

interface ImageWithSkeletonProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
}

/**
 * Resim yüklenene kadar animasyonlu skeleton gösterir.
 * loading="lazy" otomatik eklenir.
 */
export function ImageWithSkeleton({
    src,
    alt,
    className,
    fallbackSrc = "/images/placeholder.webp",
}: ImageWithSkeletonProps) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Skeleton */}
            {!loaded && (
                <div className="absolute inset-0 bg-muted/30 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
                </div>
            )}

            <img
                src={error ? fallbackSrc : src}
                alt={alt}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                onError={() => {
                    setError(true);
                    setLoaded(true);
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
