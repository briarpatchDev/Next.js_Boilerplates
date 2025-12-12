"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./tempToast.module.css";
import classNames from "classnames";
import { ToastComponentProps } from "./createToast";

export default function Toast({
  message,
  type,
  closeFunction,
  title,
  autoClose = true,
  duration = 3000,
}: ToastComponentProps) {
  title = title === undefined ? "" : title;
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => closeFunction?.(), duration);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div
      className={classNames(styles.temp_toast, styles[type])}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <div className={styles.message_container}>
        <div>
          {title ? <div className={styles.title}>{title}</div> : null}
          <div
            className={classNames(styles.message, { [styles.indent]: title })}
          >
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
