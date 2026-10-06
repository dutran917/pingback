import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return ["", "/privacy", "/terms"].map((path) => ({ url: `${base}${path}`, changeFrequency: path ? "yearly" : "weekly", priority: path ? .3 : 1 }));
}
