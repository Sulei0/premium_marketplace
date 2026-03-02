/**
 * Client-side image compression utility.
 * Resizes images before upload to reduce file size dramatically.
 * A typical phone photo (3-8MB JPEG) → ~100-300KB WebP.
 */

interface CompressOptions {
    /** Maximum width in pixels. Default: 1200 */
    maxWidth?: number;
    /** Maximum height in pixels. Default: 1200 */
    maxHeight?: number;
    /** Output quality 0-1. Default: 0.82 */
    quality?: number;
    /** Output MIME type. Default: 'image/webp' */
    outputType?: string;
}

/**
 * Compress an image File using Canvas API.
 * Returns a new compressed File ready for upload.
 * 
 * @example
 * const compressed = await compressImage(file, { maxWidth: 1200 });
 * // Upload `compressed` instead of `file`
 */
export async function compressImage(
    file: File,
    options: CompressOptions = {}
): Promise<File> {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.82,
        outputType = "image/webp",
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;

            // Calculate new dimensions maintaining aspect ratio
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            // Draw to canvas at new size
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Canvas context not available"));
                return;
            }

            // Use high quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Canvas toBlob failed"));
                        return;
                    }

                    // Determine extension from output type
                    const ext = outputType === "image/webp" ? ".webp" :
                        outputType === "image/jpeg" ? ".jpg" : ".png";

                    // Create a new File with the compressed data
                    const baseName = file.name.replace(/\.[^.]+$/, "");
                    const compressedFile = new File(
                        [blob],
                        `${baseName}${ext}`,
                        { type: outputType }
                    );

                    resolve(compressedFile);
                },
                outputType,
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            // If compression fails, return original file
            resolve(file);
        };

        img.src = url;
    });
}

/**
 * Compress for avatar — smaller dimensions since avatars display at max 192px.
 */
export function compressAvatar(file: File): Promise<File> {
    return compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
    });
}

/**
 * Compress for product images — higher res for detail view.
 */
export function compressProductImage(file: File): Promise<File> {
    return compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
    });
}

/**
 * Compress for chat images — medium quality.
 */
export function compressChatImage(file: File): Promise<File> {
    return compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.78,
    });
}
