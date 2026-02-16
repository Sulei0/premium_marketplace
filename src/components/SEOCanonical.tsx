import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const SEOCanonical = (): null => {
    const location = useLocation();

    useEffect(() => {
        const canonicalUrl = window.location.origin + window.location.pathname + window.location.search;
        let link = document.querySelector("link[rel='canonical']");

        if (!link) {
            link = document.createElement("link");
            link.setAttribute("rel", "canonical");
            document.head.appendChild(link);
        }

        link.setAttribute("href", canonicalUrl);
    }, [location]);

    return null;
};
