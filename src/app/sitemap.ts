import type { MetadataRoute } from 'next';
// Ensure this route is statically exported when using `output: 'export'`.
export const dynamic = 'force-static'
// For static HTML export, ensure no ISR revalidation is requested.
export const revalidate = false
import { getPosts } from './components/posts';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ras.ece.utexas.edu';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    '',          // /
    '/join',
    '/support',
    '/leaders',
    '/blog',
    '/embed',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(route => ({
    url: `${BASE_URL}${route === '' ? '/' : route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : 0.7,
  }));

  const posts = getPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date || now),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
  return [...staticEntries, ...postEntries];
}
