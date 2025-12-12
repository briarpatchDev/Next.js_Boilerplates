"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useContextMenu } from "@/app/hooks/useContextMenu";
import styles from "./contextMenu.module.css";

type Props = {
  items: Array<string>;
};

const ContextMenu = ({ items }: Props) => {
  const { anchorPoint, isShown } = useContextMenu();

  if (!isShown) {
    return null;
  }

  return (
    <ul
      className={styles.contextMenu}
      style={{ top: anchorPoint.y, left: anchorPoint.x }}
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};

export { ContextMenu };
