import React from "react";
import BlankLayout from "@/app/layouts/BlankLayout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BlankLayout>{children}</BlankLayout>;
}
