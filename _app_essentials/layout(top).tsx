import type { Metadata } from "next";
import "@/app/globals.css";
import { User, UserProvider } from "@/app/contexts/userContext";
import { getCurrentUser } from "@/app/lib/auth/getCurrentUser";
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: `#434360`,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://website.com"),
  title: "Website",
  description: `This description will appear in search results`,
  openGraph: {
    title: "Website",
    description: "The opengraph description appears below the image and title",
    url: "https://website.com",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser(["avatar"]);
  return (
    <UserProvider user={user}>
      <html>
        <body>{children}</body>
      </html>
    </UserProvider>
  );
}
