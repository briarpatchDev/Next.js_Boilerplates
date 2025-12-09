import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Toast Testing",
  description: "This layout later is for data fetching and metadata",
};

export default function BlankLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
