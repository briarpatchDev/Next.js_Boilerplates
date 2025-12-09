"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";
import Toast from "@/app/ui/Toast/toast";
import { cssTransition, toast, ToastContainer } from "react-toastify";
import SomeButtons from "./someButtons";
import OtherButtons from "./otherButtons";

export default function Page() {
  return (
    <div className={styles.page}>
      <SomeButtons />
      <div
        style={{ width: "20rem", textWrap: "balance" }}
      >{`Here we have two entirely seperate components that send toasts to the same place`}</div>
      <OtherButtons />
    </div>
  );
}
