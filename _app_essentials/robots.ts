import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: [
          "/account",
          `/login`,
          "/signup",
          "/reset-password",
          "/change-password",
          "/verify",
          "/account-deleted",
          "/api/",
          "/dev/",
        ],
      },
    ],
    sitemap: "https://website.com/sitemap.xml",
  };
}
