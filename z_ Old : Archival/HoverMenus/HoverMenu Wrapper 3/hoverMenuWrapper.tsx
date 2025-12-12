"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import styles from "./hoverMenuWrapper.module.css";
import classNames from "classnames";

/*  Displays a menu when you hover over the child element
 *    children - the items which the hover event will be given to
 *    content - the inputed menu component / html
 *    direction - the direction which the menu will appear
 *    arrow? - adds an arrow to the menu pointing towards the child elements
 *    arrowPosition? - the horizontal or vertical position of the arrow, should be perpendicular of "direction"
 *    shift?         - shifts the menu towards one side, should be opposite of "arrowPosition"
 *    shiftAmount?   - shifts the menu by inputed rem
 */
interface HoverMenuProps {
  children: React.ReactNode;
  content: React.ReactNode;
  direction: "top" | "right" | "bottom" | "left";
  offset?: number;
  delay?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  arrow?: boolean;
  arrowPosition?: "middle" | "top" | "right" | "left" | "bottom";
  centeredArrow?: boolean;
  shift?: "middle" | "top" | "right" | "left" | "bottom";
  shiftAmount?: number;
  arrowLength?: number;
  arrowWidth?: number;
  role?: string;
  ariaLabel?: string;
}

export default function HoverMenuProps({
  children,
  content,
  direction = "bottom",
  offset = 0.0,
  delay = 0,
  backgroundColor = "var(--background)",
  borderWidth = 0.1,
  borderColor = "var(--borderColor)",
  arrow = false,
  arrowPosition = "middle",
  centeredArrow = false,
  shift = "middle",
  shiftAmount = 0.0,
  arrowLength = 0.0,
  arrowWidth = 0.0,
  role = "menu",
  ariaLabel = "Menu",
}: HoverMenuProps) {
  const [active, setActive] = useState(false);

  const [offsetStyles, setOffsetStyles] = useState({
    top: "",
    right: "",
    bottom: "",
    left: "",
  });

  const hoverMenuRef = useRef<null | HTMLDivElement>(null);
  const childrenRef = useRef<null | HTMLDivElement>(null);
  const [appear, setAppear] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  //Adds the menu after an optional delay
  function addMenu() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setActive(true);
    timerRef.current = setTimeout(() => setAppear(true), 1 + delay);
  }

  //Removes the menu
  function removeMenu() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setAppear(false);
    timerRef.current = setTimeout(() => setActive(false), 500);
  }

  //Clears the timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  //Moves the tooltip to one of the sides when it becomes active
  useEffect(() => {
    if (hoverMenuRef.current && childrenRef.current) {
      let offsetCopy = { ...offsetStyles };
      const offsets = {
        top: (hoverMenuRef.current.clientHeight + borderWidth * 10) / 10,
        bottom: (hoverMenuRef.current.clientHeight + borderWidth * 10) / 10,
        right: (hoverMenuRef.current.clientWidth + borderWidth * 10) / 10,
        left: (hoverMenuRef.current.clientWidth + borderWidth * 10) / 10,
      };
      offsetCopy[direction] = `-${offsets[direction]}rem`;
      if (shift !== "middle") {
        const oppositeDirections: Record<
          "top" | "right" | "bottom" | "left",
          "top" | "right" | "bottom" | "left"
        > = {
          top: "top",
          right: "left",
          bottom: "bottom",
          left: "right",
        };
        offsetCopy[oppositeDirections[shift]] = `${shiftAmount}rem`;
      } else {
        const shifts = {
          top:
            childrenRef.current.clientHeight / 2 -
            hoverMenuRef.current.clientHeight / 2,
          left:
            childrenRef.current.clientWidth / 2 -
            hoverMenuRef.current.clientWidth / 2,
        };
        const adjacentDirections: Record<
          "top" | "right" | "bottom" | "left",
          "top" | "left"
        > = {
          top: "left",
          right: "top",
          bottom: "left",
          left: "top",
        };
        offsetCopy[adjacentDirections[direction]] = `${
          shifts[adjacentDirections[direction]] / 10
        }rem`;
      }
      setOffsetStyles(offsetCopy);
    }
    return () => {};
  }, [active]);

  //Creates the styles for the arrow
  function arrowBeforeStyle() {
    let borderWidths = {
      top: [`${arrowLength}rem`, `${arrowWidth}rem`, `0`, `${arrowWidth}rem`],
      right: [`${arrowWidth}rem`, `${arrowLength}rem`, `${arrowWidth}rem`, `0`],
      bottom: [
        `0`,
        `${arrowWidth}rem`,
        `${arrowLength}rem`,
        `${arrowWidth}rem`,
      ],
      left: [`${arrowWidth}rem`, `0`, `${arrowWidth}rem`, `${arrowLength}rem`],
    };
    let borderColors = {
      top: [borderColor, `transparent`, `transparent`, `transparent`],
      right: [`transparent`, borderColor, `transparent`, `transparent`],
      bottom: [`transparent`, `transparent`, borderColor, `transparent`],
      left: [`transparent`, `transparent`, `transparent`, borderColor],
    };
    if (!childrenRef.current || !hoverMenuRef.current) return {};
    const shifts = centeredArrow
      ? {
          middle: {},
          top: {
            bottom: `${
              childrenRef.current.clientHeight / 20 - arrowWidth - shiftAmount
            }rem`,
          },
          right: {
            right: `${
              childrenRef.current.clientWidth / 20 - arrowWidth - shiftAmount
            }rem`,
          },
          bottom: {
            top: `${
              childrenRef.current.clientHeight / 20 - arrowWidth - shiftAmount
            }rem`,
          },
          left: {
            left: `${
              childrenRef.current.clientWidth / 20 - arrowWidth - shiftAmount
            }rem`,
          },
        }
      : {
          middle: {},
          top: {
            bottom: `${hoverMenuRef.current.clientHeight / 100}rem`,
          },
          right: {
            right: `${hoverMenuRef.current.clientWidth / 100}rem`,
          },
          bottom: {
            top: `${hoverMenuRef.current.clientHeight / 100}rem`,
          },
          left: {
            left: `${hoverMenuRef.current.clientWidth / 100}rem`,
          },
        };

    return {
      borderWidth: borderWidths[direction].join(" "),
      borderColor: borderColors[direction].join(" "),
      ...shifts[arrowPosition],
    };
  }

  //Creates the styles for the arrow
  function arrowAfterStyle() {
    let borderWidths = {
      top: [
        `${arrowLength - (arrowLength * borderWidth) / arrowWidth}rem`,
        `${arrowWidth - borderWidth}rem`,
        `0`,
        `${arrowWidth - borderWidth}rem`,
      ],
      right: [
        `${arrowWidth - borderWidth}rem`,
        `${arrowLength - (arrowLength * borderWidth) / arrowWidth}rem`,
        `${arrowWidth - borderWidth}rem`,
        `0`,
      ],
      bottom: [
        `0`,
        `${arrowWidth - borderWidth}rem`,
        `${arrowLength - (arrowLength * borderWidth) / arrowWidth}rem`,
        `${arrowWidth - borderWidth}rem`,
      ],
      left: [
        `${arrowWidth - borderWidth}rem`,
        `0`,
        `${arrowWidth - borderWidth}rem`,
        `${arrowLength - (arrowLength * borderWidth) / arrowWidth}rem`,
      ],
    };
    let borderColors = {
      top: [backgroundColor, `transparent`, `transparent`, `transparent`],
      right: [`transparent`, backgroundColor, `transparent`, `transparent`],
      bottom: [`transparent`, `transparent`, backgroundColor, `transparent`],
      left: [`transparent`, `transparent`, `transparent`, backgroundColor],
    };
    let transforms = {
      middle: "",
      top: `translateY(-${borderWidth}rem)`,
      bottom: `translateY(${borderWidth}rem)`,
      right: `translateX(-${borderWidth}rem)`,
      left: `translateX(${borderWidth}rem)`,
    };

    if (!childrenRef.current || !hoverMenuRef.current) return {};
    const shifts = centeredArrow
      ? {
          middle: {},
          top: {
            bottom: `${
              childrenRef.current.clientHeight / 20 - arrowWidth - shiftAmount
            }rem`,
          },
          right: {
            right: `${
              childrenRef.current.clientWidth / 20 - arrowWidth - shiftAmount
            }rem`,
          },
          bottom: {
            top: `${
              childrenRef.current.clientHeight / 20 - arrowWidth - shiftAmount
            }rem`,
          },
          left: {
            left: `${
              childrenRef.current.clientWidth / 20 - arrowWidth - shiftAmount
            }rem`,
          },
        }
      : {
          middle: {},
          top: {
            bottom: `${hoverMenuRef.current.clientHeight / 100}rem`,
          },
          right: {
            right: `${hoverMenuRef.current.clientWidth / 100}rem`,
          },
          bottom: {
            top: `${hoverMenuRef.current.clientHeight / 100}rem`,
          },
          left: {
            left: `${hoverMenuRef.current.clientWidth / 100}rem`,
          },
        };

    return {
      borderWidth: borderWidths[direction].join(" "),
      borderColor: borderColors[direction].join(" "),
      transform: transforms[arrowPosition],
      ...shifts[arrowPosition],
    };
  }

  return (
    <div
      className={styles.hoverMenuWrapper}
      onMouseOver={addMenu}
      onMouseLeave={removeMenu}
    >
      {active && (
        <div
          ref={hoverMenuRef}
          className={classNames(styles.hoverMenu, {
            [styles.appear]: appear,
          })}
          data-direction={direction}
          data-arrowposition={arrowPosition}
          role={role}
          aria-label={ariaLabel}
          style={{
            paddingTop:
              direction === "bottom" ? `${arrowLength + offset}rem` : "",
            paddingRight:
              direction === "left" ? `${arrowLength + offset}rem` : "",
            paddingBottom:
              direction === "top" ? `${arrowLength + offset}rem` : "",
            paddingLeft:
              direction === "right" ? `${arrowLength + offset}rem` : "",
            ...offsetStyles,
          }}
        >
          <div className={styles.content}>
            {arrow ? (
              <>
                <div
                  className={styles.arrow_before}
                  style={arrowBeforeStyle()}
                ></div>
                <div
                  className={styles.arrow_after}
                  style={arrowAfterStyle()}
                ></div>
              </>
            ) : null}
            {content}
          </div>
        </div>
      )}
      <div ref={childrenRef} aria-expanded={active}>
        {children}
      </div>
    </div>
  );
}
