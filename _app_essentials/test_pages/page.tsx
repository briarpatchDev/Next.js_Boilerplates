import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Pages",
  description: `These are our test pages`,
};

export default function Page() {
  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <div>
          <h1>{`Navbar`}</h1>
          <Link href="/test_pages/navbar">{`Navbar`}</Link>
        </div>
        <div>
          <h1>{`Misc`}</h1>
          <Link href="/test_pages/contact-us">{`Contact Us`}</Link>
          <Link href="/test_pages/404">{`404`}</Link>
        </div>
        <div>
          <h1>{`TOS & PP`}</h1>
          <Link href="/test_pages/policy/tos">{`Terms of Service`}</Link>
          <Link href="/test_pages/policy/pp">{`Privacy Policy`}</Link>
        </div>
      </div>
    </div>
  );
}
