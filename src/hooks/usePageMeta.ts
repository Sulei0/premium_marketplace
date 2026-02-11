import { useEffect } from "react";

const DEFAULT_TITLE = "Giyenden";
const DEFAULT_DESC =
    "Türkiye'nin ilk premium ve gizli odaklı C2C pazar yeri. Kişisel eşyalarınızı güvenle alıp satın.";

/**
 * Dinamik sayfa başlığı ve meta description ayarlar.
 * Sayfa unmount olduğunda varsayılana döner.
 */
export function usePageMeta(title?: string, description?: string) {
    useEffect(() => {
        const prev = document.title;

        document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", description || DEFAULT_DESC);
        }

        return () => {
            document.title = prev;
        };
    }, [title, description]);
}
