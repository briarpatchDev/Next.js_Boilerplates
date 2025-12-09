"use client";
import { useRef, useState, useEffect } from "react";
import { cssTransition, ToastContainer } from "react-toastify";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const enter = "error_toast_enter";
  const exit = "error_toast_exit";
  const transition = cssTransition({
    enter: enter,
    exit: exit,
  });

  return (
    <>
      {children}
      <ToastContainer
        limit={1}
        transition={transition}
        position={"top-center"}
      />
    </>
  );
}
