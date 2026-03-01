import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// manually load .env since dotenv isn't a dependency
const loadEnv = () => {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
                process.env[key] = val;
            }
        });
    }
};

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://giyenden.com';

async function generateSitemap() {
    console.log("Generating sitemap...");

    const urls = [
        { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${BASE_URL}/products`, priority: '0.9', changefreq: 'daily' },
        { loc: `${BASE_URL}/about`, priority: '0.6', changefreq: 'monthly' },
        { loc: `${BASE_URL}/kvkk`, priority: '0.5', changefreq: 'yearly' },
        { loc: `${BASE_URL}/privacy`, priority: '0.5', changefreq: 'yearly' },
        { loc: `${BASE_URL}/terms`, priority: '0.5', changefreq: 'yearly' },
    ];

    // Fetch active products
    console.log("Fetching products...");
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, created_at')
        .eq('is_active', true)
        .eq('is_approved', true)
        .eq('is_sold', false);

    if (productsError) {
        console.error("Error fetching products:", productsError.message);
    } else if (products) {
        products.forEach(p => {
            urls.push({
                loc: `${BASE_URL}/product/${p.id}`,
                priority: '0.8',
                changefreq: 'weekly',
                lastmod: new Date(p.created_at).toISOString().split('T')[0]
            });
        });
    }

    // Fetch public profiles (assuming all profiles are public to view)
    console.log("Fetching profiles...");
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id');

    if (profileError) {
        console.error("Error fetching profiles:", profileError.message);
    } else if (profiles) {
        profiles.forEach(p => {
            urls.push({
                loc: `${BASE_URL}/profile/${p.id}`,
                priority: '0.7',
                changefreq: 'weekly',
                lastmod: new Date().toISOString().split('T')[0]
            });
        });
    }

    // Fetch published blog posts
    console.log("Fetching blog posts...");
    const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('is_published', true)
        .order('updated_at', { ascending: false });

    if (blogError) {
        console.error("Error fetching blog posts:", blogError.message);
    } else if (blogPosts) {
        // Add the main /kose listing page
        urls.push({
            loc: `${BASE_URL}/kose`,
            priority: '0.8',
            changefreq: 'weekly',
            lastmod: blogPosts[0]
                ? new Date(blogPosts[0].updated_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
        });

        // Add each individual blog post
        blogPosts.forEach(post => {
            urls.push({
                loc: `${BASE_URL}/kose/${post.slug}`,
                priority: '0.85',
                changefreq: 'weekly',
                lastmod: new Date(post.updated_at).toISOString().split('T')[0]
            });
        });

        console.log(`  → ${blogPosts.length} blog yazısı eklendi.`);
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
    }

    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');

    console.log(`✅ Sitemap successfully generated at ${sitemapPath} with ${urls.length} URLs.`);
}

generateSitemap().catch(console.error);
