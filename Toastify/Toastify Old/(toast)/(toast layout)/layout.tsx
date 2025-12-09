"use client";
import { cssTransition, ToastContainer } from "react-toastify";
import "@/app/globals.css";

export default function ToastLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // These animations should be in your globals.css file 
  const transition = cssTransition({
    enter: "Toastify__bounce-enter--bottom-center",
    exit: "toast-exit-custom",
  });

  return (
    <>
      <ToastContainer transition={transition} limit={6} />
      {children}
    </>
  );
}
