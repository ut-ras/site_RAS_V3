import { getPosts } from '../components/posts'

// Ensure this route is statically exported for `output: 'export'` builds
export const dynamic = 'force-static'
export const revalidate = false

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://utras.org'

function buildSitemapXml(): string {
  const now = new Date()

  const staticRoutes = ['', '/join', '/support', '/leaders', '/blog', '/embed']

  const urls = staticRoutes.map(route => ({
    loc: `${BASE_URL}${route === '' ? '/' : route}`,
    lastmod: now.toISOString(),
  }))

  const posts = getPosts()
  const postUrls = posts.map(p => ({ loc: `${BASE_URL}/blog/${p.slug}`, lastmod: new Date(p.date || now).toISOString() }))

  const allUrls = [...urls, ...postUrls]

  const urlEntries = allUrls
    .map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`
}

export async function GET() {
  const xml = buildSitemapXml()
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
