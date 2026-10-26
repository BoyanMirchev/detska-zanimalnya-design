import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/testove/dashboard",
        "/testove/rezultati/",
        "/testove/nova-parola",
      ],
    },

    sitemap: "https://www.хралупата.com/sitemap.xml",
  }
}
