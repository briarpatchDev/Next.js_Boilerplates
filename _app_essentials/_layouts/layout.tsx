import type { Metadata } from "next";
import "@/app/globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Website",
  description: `This description will appear in search results`,
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={styles.layout}>{children}</div>;
}
