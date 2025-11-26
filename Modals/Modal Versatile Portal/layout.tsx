import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modal Layout",
  description: "This is a layout with a modal",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div id="modal"></div>
      {children}
    </>
  );
}
