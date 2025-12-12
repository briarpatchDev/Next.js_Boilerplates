import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "./navbar";

export default function Page() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        height: "max-content",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Navbar />
    </div>
  );
}
