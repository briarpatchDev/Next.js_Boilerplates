"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./loader.module.css";

interface LoaderProps {
  color?: string;
}

export default function Loader({ color }: LoaderProps) {
  return (
    <span
      className={styles.loader}
      style={{ borderColor: color, borderBottomColor: "transparent" }}
      role="status"
      aria-live="polite"
      aria-label="Loading..."
    ></span>
  );
}
