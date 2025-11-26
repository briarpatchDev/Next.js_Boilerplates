"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./component.module.css";
import classNames from "classnames";

interface ComponentProps {
  style?: React.CSSProperties;
}

export default function Component({ style }: ComponentProps) {
  const [property, setProperty] = useState(<div>Welcome!</div>);

  //componentDidMount, runs when component mounts and returns on dismount
  useEffect(() => {
    return () => {};
  }, []);

  return <div style={{ ...style }}></div>;
}
