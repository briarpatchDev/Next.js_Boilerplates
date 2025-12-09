"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import styles from "./card.module.css";

interface CardProps {
  height: string;
  width: string;
  src: string;
  alt: string;
  headline: string;
  description: string;
  button: JSX.Element;
}

export default function Card({
  height,
  width,
  src,
  alt,
  headline,
  description,
  button,
}: CardProps) {
  return (
    <div
      className={styles.card}
      style={{
        height: height,
        minHeight: height,
        width: width,
        minWidth: width,
      }}
    >
      <div className={styles.content}>
        <Image
          className={styles.image}
          src={src}
          width={800}
          height={800}
          alt={alt}
        />
        <h1 className={styles.headline}>{headline}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.bottom}>
        <div className={styles.fade}></div>
        {button}
      </div>
    </div>
  );
}
