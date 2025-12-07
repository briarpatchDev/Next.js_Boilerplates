import React from "react";
import "@/app/globals.css";
import TabsLayout from "@/app/ui/Tabs/Tabs Layout/tabsLayout";

const tabs = [
  {
    label: "Actions",
    href: "/tabsLayout/actions",
  },
  {
    label: "Analysis",
    href: "/tabsLayout/analysis",
  },
  {
    label: "Details",
    href: "/tabsLayout/details",
  },
  {
    label: "This Tab is Too Long",
    href: "/tabsLayout/long",
  },
  {
    label: "Overview",
    href: "/tabsLayout/overview",
  },
  {
    label: "Summary",
    href: "/tabsLayout/summary",
  },
  {
    label: "Even More",
    href: "/tabsLayout/words",
  },
];

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TabsLayout tabs={tabs}>{children}</TabsLayout>;
}
