"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./linkButton.module.css";
import classNames from "classnames";
import { Button } from "../Button Set 1/button";

/*
 *   A link that has the appearance of a button.
 *   You'll want to make the Link's styling match well with the Button's.
 *
 *   href - the href for the link
 *   target? - target for the link
 *   externalLink? - uses an anchor element instead if link is external
 *   children?, text?, icon?, variant? - passed to Button
 *   linkStyle? - extra link styles
 *   buttonStyle - extra button styles
 */
interface LinkButtonProps {
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  children?: React.ReactNode;
  text?: string;
  icon?: JSX.Element;
  variant?: "primary" | "secondary" | "tertiary";
  width?: "default" | "smallest" | "full" | number;
  ariaLabel?: string;
  linkStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
}

export default function LinkButton(
  {
    href,
    target,
    children,
    text,
    icon,
    variant = "primary",
    width = "default",
    ariaLabel,
    linkStyle,
    buttonStyle,
  }: LinkButtonProps,
  ref?: React.Ref<HTMLAnchorElement>
) {
  // Checks if href starts with http or https (meannig it would be an external link)
  function isExternalLink(href: string) {
    return /^https?:\/\//.test(href);
  }

  const button = (
    <Button
      variant={variant}
      tabIndex={-1}
      width={width}
      style={{ ...buttonStyle }}
      onClick={() => {}}
      text={text}
      icon={icon}
    >
      {children}
    </Button>
  );

  return isExternalLink(href) ? (
    <a
      className={styles.link}
      aria-label={ariaLabel}
      href={href}
      target={target || "_blank"}
      ref={ref}
      style={{ ...linkStyle }}
    >
      {button}
    </a>
  ) : (
    <Link
      className={styles.link}
      aria-label={ariaLabel}
      href={href}
      ref={ref}
      style={{ ...linkStyle }}
    >
      {button}
    </Link>
  );
}
