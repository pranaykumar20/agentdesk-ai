import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/marketing/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const paths = [
    "/",
    "/features",
    "/industries",
    "/pricing",
    "/integrations",
    "/security",
    "/audit",
    "/login",
    "/signup",
  ];

  return paths.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
