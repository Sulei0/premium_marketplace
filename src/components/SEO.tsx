import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
    title: string;
    description?: string;
}

export function SEO({ title, description }: SEOProps): null {
    const location = useLocation();

    useEffect(() => {
        document.title = title;
        if (description) {
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute("content", description);
            } else {
                const meta = document.createElement("meta");
                meta.name = "description";
                meta.content = description;
                document.head.appendChild(meta);
            }
        }
    }, [title, description, location]);

    return null;
}
