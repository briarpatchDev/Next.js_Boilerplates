"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./clickPopoverPortal.module.css";
import classNames from "classnames";
import { throttle } from "lodash";
import { FocusTrap } from "focus-trap-react";

/*  Displays a popover panel when you click over an element
 *    children       - the elements which the click event will be given to
 *    panel          - the inputed panel that will be displayed on click
 *    panelId?       - id for the panel, also used in aria-describedBy
 *    direction      - the direction which the panel will be anchored to
 *    portalTargetRef - the ref to which the panel will be appended to
 *    anchorRef       - optional ref, panel will position itself relative to the anchorRef rather than children
 *    offset         - adds a gap between the children and the panel, in rem (can be negative also)
 *    shiftRem?      - shifts the panel in rem
 *    shiftChildPercent?  - shifts the panel, by a percent of the children's width / height
 *    shiftPanelPercent? - shifts the panel, by a percent of the panel's width / height
 *    fadeEffect?    - plays the default fade in / out animation, default true
 *    closingTime?   - the time it takes for the panel to close, in ms
 *    boundaryDetection? - moves the panel if it goes out of bounds of the portalTarget, default true
 *    panelRole?          - the role of the panel
 *    ariaLabelChildren? - the aria label for the children
 *    ariaLabelPanel?   - the aria label for the panel
 *    focusable?        - default true, allows the component to be tab focused like a button
 */
interface ClickPopoverPortalProps {
  children: React.ReactNode;
  panel: React.ReactNode;
  panelId: string;
  direction: Direction;
  portalTargetRef: React.RefObject<HTMLElement>;
  anchorRef?: React.RefObject<HTMLElement>;
  offset?: number;
  shiftRem?: number;
  shiftChildPercent?: number;
  shiftPanelPercent?: number;
  fadeEffect?: boolean;
  closingTime?: number;
  boundaryDetection?: boolean;
  panelRole?: "dialog" | "menu";
  ariaLabelChildren?: string;
  ariaLabelPanel?: string;
  focusable?: boolean;
}

type Side = "top" | "right" | "bottom" | "left";
type Align = "left" | "right" | "top" | "bottom" | "middle";
type Direction =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "left-top"
  | "left-bottom"
  | "right"
  | "right-top"
  | "right-bottom";

// Splits the direction into a side and an alignment
function parseDirection(direction: Direction): { side: Side; align: Align } {
  const [side, align] = direction.split("-") as [Side, Align?];
  return {
    side: side,
    align: align ?? "middle",
  };
}

const positionObject = {
  transform: "",
};

export default function HoverPopoverPortal({
  children,
  panel,
  panelId,
  direction,
  portalTargetRef,
  anchorRef,
  offset = 0.0,
  shiftRem = 0.0,
  shiftChildPercent = 0,
  shiftPanelPercent = 0,
  fadeEffect = true,
  closingTime = 300,
  boundaryDetection = true,
  panelRole = "dialog",
  ariaLabelChildren = "Click to reveal more information",
  ariaLabelPanel = "Revealed panel",
  focusable = true,
}: ClickPopoverPortalProps) {
  const [active, setActive] = useState(false);
  const [closing, setClosing] = useState(false);

  const childrenRef = useRef<null | HTMLDivElement>(null);
  const panelRef = useRef<null | HTMLDivElement>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  //Clears the timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Adds the panel
  function addPanel() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setClosing(false);
    setActive(true);
  }
  // Removes the panel
  function removePanel() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setClosing(true);
    timerRef.current = setTimeout(() => {
      setActive(false);
      setClosing(false);
    }, closingTime);
  }

  // Remove the panel if the user clicks outside of it
  function handleClick(e: MouseEvent) {
    if (!panelRef.current || !panelRef.current.contains(e.target as Node)) {
      document.removeEventListener("click", handleClick);
      removePanel();
    }
  }

  //Closes the panel when user hits Escape
  const escapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      removePanel();
    }
  }, []);

  //Moves the panel to one of the sides when it becomes active, adds events for positioning
  useEffect(() => {
    if (active) {
      calculatePosition();
      document.addEventListener("click", handleClick);
      window.addEventListener("scroll", throttledCalculatePosition);
      window.addEventListener("keydown", escapeKey);
      return () => {
        window.removeEventListener("scroll", throttledCalculatePosition);
        window.removeEventListener("keydown", escapeKey);
        document.removeEventListener("click", handleClick);
      };
    }
  }, [active]);

  // Calculates the position of the panel when the window is resized
  const throttledCalculatePosition = useCallback(
    throttle(() => {
      calculatePosition();
    }, 100),
    []
  );

  // Watches the portal target for changes in size, and recalculates the position
  useEffect(() => {
    if (!portalTargetRef?.current) return;
    const observer = new ResizeObserver(() => {
      calculatePosition();
    });
    observer.observe(portalTargetRef.current);
    return () => observer.disconnect();
  }, [portalTargetRef]);

  //Calculate the position for the panel to appear
  function calculatePosition() {
    if (
      !panelRef.current ||
      !childrenRef.current ||
      !portalTargetRef ||
      !portalTargetRef.current
    )
      return;
    const positionCopy = { ...positionObject };
    const { side, align } = parseDirection(direction);

    // Boolean to check if panel appears vertically or horizontally
    const verticalDirection = side === "top" || side === "bottom";

    // Keeps track of our translate values
    const translates = { x: 0, y: 0 };

    //Handles the offset
    if (offset) {
      translates[verticalDirection ? `y` : `x`] =
        side === "top" || side === "left" ? -1 * offset : offset;
    }

    let panel = panelRef.current.getBoundingClientRect();
    //Uses a different anchor element if provided
    const child =
      anchorRef && anchorRef.current
        ? anchorRef.current.getBoundingClientRect()
        : childrenRef.current.getBoundingClientRect();
    const container = portalTargetRef.current.getBoundingClientRect();

    // Moves the panel to the edge of the child element, in its correct vert / horz position
    const anchorPoints: Record<
      "top" | "right" | "bottom" | "left",
      () => void
    > = {
      top: () => {
        translates.y += (child.top - container.top - panel.height) / 10;
      },
      right: () => {
        translates.x += (child.right - container.left) / 10;
      },
      bottom: () => {
        translates.y += (child.bottom - container.top) / 10;
      },
      left: () => {
        translates.x += (child.left - container.left - panel.width) / 10;
      },
    };
    anchorPoints[side]();

    //Handles the alignment
    const alignments: Record<
      "top" | "right" | "bottom" | "left" | "middle",
      () => void
    > = {
      top: () => {
        translates.y += (child.top - container.top) / 10;
      },
      right: () => {
        translates.x += (child.right - container.left - panel.width) / 10;
      },
      bottom: () => {
        translates.y += (child.bottom - container.top - panel.height) / 10;
      },
      left: () => {
        translates.x += (child.left - container.left) / 10;
      },
      middle: () => {
        verticalDirection
          ? (translates.x +=
              (child.left + child.right - panel.width) / 20 -
              container.left / 10)
          : (translates.y +=
              (child.top + child.bottom - panel.height) / 20 -
              container.top / 10);
      },
    };
    alignments[align]();

    //Handles the shifts
    if (shiftChildPercent) {
      translates[verticalDirection ? `x` : `y`] += verticalDirection
        ? (child.width * shiftChildPercent) / 1000
        : (child.height * shiftChildPercent) / 1000;
    }

    if (shiftPanelPercent) {
      translates[verticalDirection ? `x` : `y`] += verticalDirection
        ? (panel.width * shiftPanelPercent) / 1000
        : (panel.height * shiftPanelPercent) / 1000;
    }

    if (shiftRem) {
      translates[verticalDirection ? `x` : `y`] += shiftRem;
    }

    positionCopy.transform = `translateX(${translates.x}rem) translateY(${translates.y}rem)`;

    if (boundaryDetection) {
      // Moves panel if it goes outside the container's bounds
      Object.assign(panelRef.current.style, positionCopy);
      panel = panelRef.current.getBoundingClientRect();
      if (verticalDirection) {
        //Moves panel to the bottom if it goes out of bounds to the top
        if (side === "top") {
          if (panel.top < container.top || panel.top < -child.height / 8) {
            translates.y += (child.height + panel.height) / 10;
            if (offset) {
              translates.y += 2 * offset;
            }
          }
        }
        // Moves panel right / left if it goes out of bounds to right / left
        let translateX = 0;
        if (panel.right > container.right) {
          translateX = container.right - panel.right;
        }
        if (panel.left + translateX < container.left) {
          translateX = container.left - panel.left;
        }
        translates.x += translateX / 10;
      } else {
        // Moves panel to the bottom if it goes out of bounds to right / left
        if (panel.left < container.left || panel.right > container.right) {
          translates.x = 0;
          translates.y = 0;
          if (offset) {
            translates.y += offset;
          }
          anchorPoints[`bottom`]();
          translates.x +=
            (child.left + child.right - panel.width) / 20 - container.left / 10;
          positionCopy.transform = `translateX(${translates.x}rem) translateY(${translates.y}rem)`;
          Object.assign(panelRef.current.style, positionCopy);
          panel = panelRef.current.getBoundingClientRect();
          let translateX = 0;
          if (panel.right > container.right) {
            translateX = container.right - panel.right;
          }
          if (panel.left + translateX < container.left) {
            translateX = container.left - panel.left;
          }
          translates.x += translateX / 10;
        } else {
          // Moves panel up / down if it goes out of bounds to top / bottom
          let translateY = 0;
          if (panel.bottom > container.bottom) {
            translateY = container.bottom - panel.bottom;
          }
          if (panel.top + translateY < container.top) {
            translateY = container.top - panel.top;
          }
          translates.y += translateY / 10;
        }
      }
      positionCopy.transform = `translateX(${translates.x}rem) translateY(${translates.y}rem)`;
    }
    Object.assign(panelRef.current.style, positionCopy);
  }

  // Tells the panel to play its closing animation by using the triggerCloseAnimation prop
  // This has to be set up in the panel component
  panel = React.isValidElement(panel)
    ? React.cloneElement(
        panel as React.ReactElement<{ triggerCloseAnimation?: boolean }>,
        {
          triggerCloseAnimation: closing,
        }
      )
    : panel;

  return (
    <>
      <div
        ref={childrenRef}
        aria-expanded={active}
        tabIndex={focusable ? 0 : undefined}
        onClick={() => {
          if (!active) addPanel();
        }}
        className={styles.expandable}
        aria-label={ariaLabelChildren}
        aria-describedby={panelId}
        aria-haspopup={panelRole}
        aria-controls={active ? panelId : undefined}
        role="button"
        onKeyDown={
          focusable
            ? (e) => {
                if (
                  (e.key === "Enter" || e.key === " ") &&
                  childrenRef.current?.matches(":focus-visible")
                ) {
                  active && !closing ? removePanel() : addPanel();
                }
              }
            : undefined
        }
      >
        {children}
      </div>
      {active &&
        portalTargetRef &&
        createPortal(
          <FocusTrap
            focusTrapOptions={{
              preventScroll: true,
              escapeDeactivates: true,
              clickOutsideDeactivates: true,
            }}
          >
            <div
              className={classNames(styles.panel, {
                [styles.appear]: fadeEffect,
                [styles.closing]: closing && fadeEffect,
              })}
              ref={panelRef}
              role={panelRole}
              aria-label={ariaLabelPanel}
              id={panelId}
            >
              {panel}
            </div>
          </FocusTrap>,
          portalTargetRef.current as HTMLElement
        )}
    </>
  );
}
