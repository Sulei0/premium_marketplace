import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    type?: string;
    name?: string;
    image?: string;
    url?: string;
    children?: React.ReactNode;
}

export function SEO({
    title = "Giyenden | Kadınlara Özel 2. El Moda Platformu",
    description = "Kadınlar için güvenli ve butik bir 2. el moda deneyimi. Gardırobundaki 2. el hazineleri Giyenden ile değerlendir, kadın dayanışmasının gücüne güç kat.",
    type = "website",
    name = "Giyenden",
    image = "https://giyenden.com/og-image.png",
    url = "https://giyenden.com",
    children
}: SEOProps) {
    return (
        <Helmet>
            {/* Standart Meta Etiketleri */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {/* Canonical URL */}
            <link rel="canonical" href={url} />

            {/* Facebook OpenGraph Etiketleri */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={name} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={image} />

            {/* Twitter Optimizasyonu */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {children}
        </Helmet>
    );
}
