import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/marketing/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/onboarding", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
