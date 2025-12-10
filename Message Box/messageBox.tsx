"use client";
import React, { useState, useEffect } from "react";
import LinkButton from "@/app/ui/Buttons/Link Button/linkButton";
import Button from "@/app/ui/Buttons/Button Set 1/button";
import styles from "./messageBox.module.css";
import classNames from "classnames";

/*
 *   A simple message box that has an optional button or link button
 *
 *   message - the message being displayed
 *   buttonText? - the text on the button
 *   buttonAriaLabel? - gives an aria label for the button
 *   buttonWidth? - the width of the button, default is 80 / 80% of width
 *   buttonStyle? - any additional button styles
 *   href? - the href for a link button
 *   onClick - the click event for a regular button
 *   ariaLabel?: ariaLabel for the message box
 *   ariaLive?: ariaLive property. Typically will be "polite", but occasionally "assertive" with errors
 *   role - role of the message box. Typically be "status", but occassionally "alert"
 *   style? - any additional styles for the message box
 */
interface MessageBoxProps {
  message: string;
  buttonText?: string;
  buttonAriaLabel?: string;
  buttonWidth?: "default" | "smallest" | "full" | number;
  buttonStyle?: React.CSSProperties;
  href?: string;
  onClick?: (e?: React.MouseEvent) => void;
  ariaLabel?: string;
  ariaLive: "off" | "assertive" | "polite" | undefined; //Typically will be "polite", but occasionally "assertive" with errors
  role: "status" | "alert" | undefined; // This will typically be "status", but occassionally "alert"
  style?: React.CSSProperties;
}

export default function MessageBox({
  message,
  buttonText,
  buttonAriaLabel,
  buttonWidth = 80,
  buttonStyle,
  href,
  onClick = () => {},
  ariaLabel,
  ariaLive,
  role,
  style,
}: MessageBoxProps) {
  return (
    <div
      className={styles.message_box}
      style={{ ...style }}
      aria-label={ariaLabel}
      aria-live={ariaLive}
      role={role}
    >
      <div className={styles.message}>{message}</div>
      {buttonText &&
        (href ? (
          <LinkButton
            href={href}
            text={buttonText}
            buttonStyle={{ ...buttonStyle }}
            width={buttonWidth}
            ariaLabel={buttonAriaLabel}
          />
        ) : (
          <Button
            variant={"primary"}
            onClick={onClick}
            text={buttonText}
            style={{ ...buttonStyle }}
            width={buttonWidth}
            ariaLabel={buttonAriaLabel}
          />
        ))}
    </div>
  );
}
