"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./toast.module.css";
import classNames from "classnames";
//Icons
import SuccessIcon from "./success_icon";
import WarningIcon from "./warning_icon";
import ErrorIcon from "./error_icon";
import InfoIcon from "./info_icon";
import NewsIcon from "./news_icon";
import CloseIcon from "./close_icon";

/*
 *   type - the type of message being sent (come in different color schemes)
 *   message - the message on the toast
 *   closeFunction - a function the closes the toast, typically used by toastify
 *   title - optional title that overrides our default titles, leave undefined for defaults
 *   autoClose - toast will autoClose after the duration expire
 *   duration - the time in ms before toast autoCloses
 */
interface ToastProps {
  type: "success" | "warning" | "error" | "info" | "news";
  message: string;
  closeFunction: () => void;
  title?: string;
  autoClose?: boolean;
  duration?: number;
}

const icons = {
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
  info: <InfoIcon />,
  news: <NewsIcon />,
};

const titles = {
  success: "Success!",
  warning: "Warning",
  error: "Error",
  info: "",
  news: "",
};

export default function Toast({
  type,
  message,
  closeFunction,
  title,
  autoClose = true,
  duration = 5000,
}: ToastProps) {
  title = title === undefined ? titles[type] : title;
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(closeFunction, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div
      className={classNames(styles.toast, styles[type])}
      role={type === "error" || type === "warning" ? "alert" : "status"}
      aria-live={
        type === "error" || type === "warning" ? "assertive" : "polite"
      }
      aria-atomic="true"
    >
      <div className={classNames(styles.icon_container, styles[type])}>
        {icons[type]}
      </div>
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
      <button
        className={classNames(styles.close_icon_btn, styles[type])}
        onClick={closeFunction}
        aria-label={"Close Notification"}
      >
        <CloseIcon />
      </button>
    </div>
  );
}
