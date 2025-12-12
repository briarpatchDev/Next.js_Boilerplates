import Image from "next/image";
import Link from "next/link";
import styles from "./not-found.module.css";
import type { Metadata } from "next";
import Navbar from "@/app/components/navbar/navbar";
import NotFound from "@/app/components/errors/Not Found/notFound";
import Footer from "@/app/components/Footer/footer";

export const metadata: Metadata = {
  title: "Website - 404",
  description: `Page not found`,
};

export default function Page() {
  return (
    <div className={styles.page}>
      <Navbar />
      <NotFound />
      <Footer />
    </div>
  );
}
