"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./keyboard.module.css";
import classNames from "classnames";
import KeyboardButton from "../Keyboard Button/keyboardButton";

// A boilerplate keyboard just using the number keys, shows phone number pad at mobile sizess
const keyList = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
export type Keys = (typeof keyList)[number];

//The click functions the keys will recieve
export type KeyFunctions = {
  [key in Keys]: () => void;
};

interface KeyboardProps {
  keyFunctions: KeyFunctions;
}

export default function Keyboard({ keyFunctions }: KeyboardProps) {
  const [mobileSize, setMobileSize] = useState(500); //We can handle small keyboards differently if we need to
  const [initalized, setInitalized] = useState(false);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<Keys, HTMLButtonElement | null>>({
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
  });

  //Used to create a navigation map on the keyboard from pressing directional arrows
  const navigationMap: Record<
    Keys,
    { ArrowUp?: Keys; ArrowDown?: Keys; ArrowLeft?: Keys; ArrowRight?: Keys }
  > = {
    "1": { ArrowRight: "2" },
    "2": { ArrowLeft: "1", ArrowRight: "3" },
    "3": { ArrowLeft: "2", ArrowRight: "4" },
    "4": { ArrowLeft: "3", ArrowRight: "5" },
    "5": { ArrowLeft: "4", ArrowRight: "6" },
    "6": { ArrowLeft: "5", ArrowRight: "7" },
    "7": { ArrowLeft: "6", ArrowRight: "8" },
    "8": { ArrowLeft: "7", ArrowRight: "9" },
    "9": { ArrowLeft: "8", ArrowRight: "0" },
    "0": { ArrowLeft: "9" },
  };

  //Focuses an adjacent key when user hits directional arrow
  function onButtonKeydown(
    e?: React.KeyboardEvent<HTMLButtonElement>,
    key?: Keys
  ) {
    if (!e || key === undefined) return;
    if (e.key === "Enter" && e.currentTarget.matches(":focus-visible")) {
      e?.stopPropagation();
    }
    if (
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight"
    ) {
      // If our mobile size keyboard layout is different we should return
      if (mobileSize) return; // We don't need the navigationMap on mobile sizes (and it'd be a different map too)
      e.preventDefault();
      const nextKey =
        navigationMap[key][e.key as keyof (typeof navigationMap)[typeof key]];
      if (nextKey && buttonRefs.current[nextKey]) {
        buttonRefs.current[nextKey]?.focus();
        e.preventDefault();
      }
    } else if (e.key === "Escape") {
      e.currentTarget.blur();
      e.preventDefault();
    }
  }

  //Used to create a visual indication when user types a key to press a button
  const [tokens, setTokens] = useState<Record<Keys, number>>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  });

  function handleKeydown(e: KeyboardEvent) {
    if (!keyList.includes(e.key as Keys)) return;
    // We can remove this line if our keyboard won't have disabled buttons
    if (buttonRefs.current[e.key as Keys]?.disabled) return;
    let tokenKey = e.key as Keys;
    setTokens((prev) => ({
      ...prev,
      [tokenKey]: (prev[tokenKey] ?? 0) + 1,
    }));
    if (
      keyboardRef.current &&
      keyboardRef.current.querySelector(":focus-visible")
    ) {
      buttonRefs.current[e.key as Keys]?.focus();
    }
  }

  // Adds keydown event and resize
  useEffect(() => {
    handleResize();
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleResize);
    setInitalized(true);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function handleResize() {
    setMobileSize(window.innerWidth <= 480);
  }

  /*
   *   We have the "9" disabled here for demostration purposes
   */
  return (
    <div
      className={styles.keyboard}
      ref={keyboardRef}
      aria-label="Keyboard"
      style={{ opacity: initalized ? 1 : 0 }}
    >
      <div className={styles.number_keys} aria-label="Number keys">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((i) => (
          <KeyboardButton
            key={i}
            width={"smallest"}
            onClick={keyFunctions[i as Keys]}
            keyPressToken={tokens[i as Keys]}
            ref={(el) => {
              buttonRefs.current[i as Keys] = el;
            }}
            onKeyDown={(e) => onButtonKeydown(e, i as Keys)}
            tabIndex={1}
            disabled={i === "9"}
          >
            {i}
          </KeyboardButton>
        ))}
        {mobileSize && <div className={styles.empty_space}></div>}
        <KeyboardButton
          width={"smallest"}
          onClick={keyFunctions[0]}
          keyPressToken={tokens[0]}
          ref={(el) => {
            buttonRefs.current[0] = el;
          }}
          onKeyDown={(e) => onButtonKeydown(e, "0")}
          tabIndex={1}
        >
          {"0"}
        </KeyboardButton>
        {mobileSize && <div className={styles.empty_space}></div>}
      </div>
    </div>
  );
}
