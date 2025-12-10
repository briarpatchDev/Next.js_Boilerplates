import styles from "./page.module.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import LoaderFullscreen from "@/app/ui/Loaders/Loader Fullscreen/loaderFullscreen";
import Loader from "@/app/ui/Loaders/Circle Loader 1/loader";
import MessageBox from "@/app/ui/Message Box/messageBox";

export const metadata: Metadata = {
  title: "Suspense!!",
  description: `Checking if a code is valid`,
};

async function Verify({ code }: { code: string }) {
  async function wait(time: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, time));
  }
  await wait(3000);
  const valid = true;
  return valid ? (
    <MessageBox
      message={"We found that code!"}
      buttonText="Great!"
      href="/"
      role="status"
      ariaLive="polite"
    />
  ) : (
    <MessageBox
      message={"This code doesn't exist or has expired."}
      role="status"
      ariaLive="polite"
    />
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <div className={styles.page}>
      <Suspense
        fallback={
          <LoaderFullscreen>
            <Loader />
          </LoaderFullscreen>
        }
      >
        <Verify code={code} />
      </Suspense>
    </div>
  );
}
