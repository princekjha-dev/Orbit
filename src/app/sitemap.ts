import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orbit.app";

  const staticRoutes = [
    "",
    "/login",
    "/signup",
    "/opportunities",
    "/projects",
    "/events",
    "/hackathons",
    "/communities",
    "/mod",
    "/mod/avis",
    "/mod/scout",
    "/mod/quill",
    "/mod/relay",
    "/mod/passport",
    "/mod/loop",
    "/privacy",
    "/terms",
    "/safety",
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/mod") ? 0.9 : 0.8,
  }));
}
