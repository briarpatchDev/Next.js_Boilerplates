"use client";
import React, {
  useState,
  useEffect,
  useRef,
  JSX,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./keyboardButton.module.css";
import classNames from "classnames";

/*
 *  A keyboard button meant to be used with a global keydown event, overlaps a lot with Button Set
 *
 *    keyPressToken? - we pass in a token from the keyboard to fire the onKeydown multiple times in succession
 *
 *    text? / children? - provide content of the button here, or an...
 *    icon? - you can give the button an icon
 *    variant - the kind of keyboard button this represents. The default value is "", but we can add more like
 *    onClick - the function the button performs
 *    onKeyDown? - this is used to possibly give the button keyboard controls
 *    width? - default: a default width, smallest: width is max-content, full: width is 100%
 *    ariaLabel? - gives the button an aria-label
 *    style?  - any additional CSS stylings
 *
 *    This also has most button html properties as props
 */

interface KeyboardButtonProps {
  text?: string;
  children?: React.ReactNode;
  icon?: JSX.Element;
  variant?: "";
  onClick?: Function;
  width: "default" | "smallest" | "full";
  ariaLabel?: string;
  type?: "button" | "submit" | "reset";
  form?: string;
  name?: string;
  title?: string;
  disabled?: boolean;
  tabIndex?: number;
  id?: string;
  onKeyDown?: (e?: React.KeyboardEvent<HTMLButtonElement>) => void;
  keyPressToken?: number | string;
  style?: React.CSSProperties;
}

function KeyboardButton(
  {
    text,
    children,
    icon,
    variant = "",
    onClick,
    width = "default",
    ariaLabel,
    type = "button",
    form,
    name,
    title,
    disabled = false,
    tabIndex,
    id,
    onKeyDown,
    keyPressToken,
    style,
  }: KeyboardButtonProps,
  ref: React.Ref<HTMLButtonElement>
) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => buttonRef.current!);

  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  //const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const prevToken = useRef(keyPressToken);

  const [active, setActive] = useState(false);
  const enabled = useRef(true);
  const enterKeyDown = useRef(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePointerDown = () => {
    if (enabled.current && !disabled) {
      clearTimeout(timeoutRef.current);
      enabled.current = false;
      setActive(false);
      timeoutRef.current = setTimeout(() => {
        setActive(true);
      }, 80);
    }
  };

  const handlePointerUp = () => {
    if (!enabled.current && !disabled) {
      clearTimeout(timeoutRef.current);
      setActive(true);
      enabled.current = true;
      timeoutRef.current = setTimeout(() => {
        setActive(false);
        onClick?.();
      }, 80);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if ((e.key === "Enter" || e.key === " ") && enabled.current && !disabled) {
      e.preventDefault();
      clearTimeout(timeoutRef.current);
      enabled.current = false;
      enterKeyDown.current = true;
      setActive(true);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === "Enter" || e.key === " ") && !enabled.current && !disabled) {
      e.preventDefault();
      setActive(false);
      timeoutRef.current = setTimeout(() => {
        enabled.current = true;
        enterKeyDown.current = false;
        onClick?.();
      }, 80);
    }
  };

  const handleMouseLeave = () => {
    if (!enterKeyDown.current) {
      enabled.current = true;
      setActive(false);
    }
  };

  const handleBlur = () => {
    enabled.current = true;
    enterKeyDown.current = false;
    setActive(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (buttonRef.current && e.touches.length > 0) {
      const touch = e.touches[0];
      if (
        !buttonRef.current.contains(
          document.elementFromPoint(touch.clientX, touch.clientY)
        )
      ) {
        setActive(false);
        enabled.current = true;
      }
    }
  };

  useEffect(() => {
    // Tracking the previous token lets us properly handle multiple instances of a single button
    if (keyPressToken && keyPressToken !== prevToken.current) {
      setActive(false);
      setActive(true);
      timeoutRef.current = setTimeout(() => {
        setActive(false);
        onClick?.();
      }, 160);
    }
    prevToken.current = keyPressToken;
  }, [keyPressToken]);

  return (
    <button
      ref={buttonRef}
      id={id}
      name={name}
      title={title}
      className={classNames(styles.button, styles[variant], styles[width], {
        [styles.active]: active,
        [styles.disabled]: disabled,
      })}
      onPointerDown={
        type === "submit" || disabled ? undefined : handlePointerDown
      }
      onPointerUp={type === "submit" || disabled ? undefined : handlePointerUp}
      onTouchMove={handleTouchMove}
      onKeyDown={type === "submit" || disabled ? undefined : handleKeyDown}
      onKeyUp={type === "submit" || disabled ? undefined : handleKeyUp}
      onMouseLeave={handleMouseLeave}
      onBlur={handleBlur}
      aria-label={ariaLabel}
      type={type}
      form={form}
      disabled={disabled}
      {...(disabled ? { "aria-disabled": true } : {})}
      tabIndex={disabled ? -1 : tabIndex}
      style={{ ...style }}
    >
      {icon && <div className={styles.icon_container}>{icon}</div>}
      {(children || text) && (
        <div className={styles.text_wrapper}>{children || text}</div>
      )}
    </button>
  );
}

export default forwardRef<HTMLButtonElement, KeyboardButtonProps>(
  KeyboardButton
);
