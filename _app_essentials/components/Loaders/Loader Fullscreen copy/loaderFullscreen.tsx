"use client";
import React from "react";
import styles from "./loaderFullsceen.module.css";
import { FocusTrap } from "focus-trap-react";

/**
 *  children - the loader element that will appear
 *  ariaLabel - tells what is being loaded
 *  backdropStyle - any additional tyles for the backdrop
 */
interface LoaderFullscreenProps {
  children: React.ReactNode;
  ariaLabel?: string;
  backdropStyle?: React.CSSProperties;
}

//Creates a loader thats also a modal
export default function LoaderFullscreen({
  children,
  ariaLabel = "Loading...",
  backdropStyle,
}: LoaderFullscreenProps) {
  return (
    <FocusTrap>
      <div
        className={styles.backdrop}
        role="status"
        aria-busy="true"
        aria-label={ariaLabel}
        style={backdropStyle}
      >
        <div tabIndex={0} aria-live="polite" className={styles.offscreen} />
        {children}
      </div>
    </FocusTrap>
  );
}
