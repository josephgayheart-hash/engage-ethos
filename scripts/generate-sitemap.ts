// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs"
import { resolve } from "path"

const BASE_URL = "https://www.campusvoice.ai"

interface SitemapEntry {
  path: string
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: string
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/try-copywriter", changefreq: "monthly", priority: "0.9" },
  { path: "/for-enterprise", changefreq: "monthly", priority: "0.8" },
  { path: "/for-agencies", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/features/content-dna", changefreq: "monthly", priority: "0.7" },
  { path: "/features/message-builder", changefreq: "monthly", priority: "0.7" },
  { path: "/features/journey-designer", changefreq: "monthly", priority: "0.7" },
  { path: "/features/evaluate", changefreq: "monthly", priority: "0.7" },
  { path: "/features/library", changefreq: "monthly", priority: "0.7" },
  { path: "/features/image-studio", changefreq: "monthly", priority: "0.7" },
  { path: "/features/brand-studio", changefreq: "monthly", priority: "0.7" },
  { path: "/features/ai-copywriter", changefreq: "monthly", priority: "0.7" },
  { path: "/features/brand-audit", changefreq: "monthly", priority: "0.7" },
  { path: "/features/webcrawl", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/salesforce-canvas", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
]

function generateSitemap(items: SitemapEntry[]) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  )

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n")
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries))
console.log(`sitemap.xml written (${entries.length} entries)`)
