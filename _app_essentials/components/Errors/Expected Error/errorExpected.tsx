"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./errorExpected.module.css";
import MessageBox from "@/app/ui/Message Box/messageBox";

// An error meant to show up after failed data fetches
export default function ExpectedError({
  reset,
  errorMessage = `Something went wrong while loading`,
  buttonText = `Refresh`,
}: {
  reset: (e?: React.MouseEvent) => void;
  errorMessage?: string;
  buttonText?: string;
}) {
  return (
    <div className={styles.error_wrapper}>
      <MessageBox
        onClick={reset}
        message={errorMessage}
        buttonText={buttonText}
        ariaLive="assertive"
        role="alert"
      />
    </div>
  );
}
