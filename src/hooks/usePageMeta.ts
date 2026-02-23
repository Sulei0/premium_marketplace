import { useEffect } from "react";

const DEFAULT_TITLE = "Giyenden";
const DEFAULT_DESC =
    "Kadınlar için güvenli ve butik bir 2. el moda deneyimi. Gardırobundaki 2. el hazineleri Giyenden ile değerlendir, kadın dayanışmasının gücüne güç kat.";

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
