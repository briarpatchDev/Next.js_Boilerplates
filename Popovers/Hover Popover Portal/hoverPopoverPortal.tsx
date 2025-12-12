"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./hoverPopoverPortal.module.css";
import classNames from "classnames";
import { throttle } from "lodash";

/*  Displays a popover panel when you hover over an element
 *    children       - the elements which the hover event will be given to
 *    panel          - the inputed panel that will be displayed on hover
 *    panelId?        - id for the panel, also used in aria-describedBy
 *    direction      - the direction which the panel will be anchored to
 *    portalTargetRef - the ref to which the panel will be appended to
 *    anchorRef       - optional ref, panel will position itself relative to the anchorRef rather than children
 *    offset         - adds a gap via padding between the children and the panel, in rem (can be negative also)
 *    offsetPadding? - boolean for if padding will be used to create the offset, default true
 *    align?         - aligns the panel on a side of the children, flows the opposite direction, MUST be perpendicular of "direction"
 *    shiftRem?      - shifts the panel in rem
 *    shiftChildPercent?  - shifts the panel, by a percent of the children's width / height
 *    shiftPanelPercent? - shifts the panel, by a percent of the panel's width / height
 *    fadeEffect?    - plays the default fade in / out animation, default true
 *    closingTime?   - the time it takes for the panel to close, in ms
 *    boundaryDetection? - moves the panel if it goes out of bounds of the portalTarget, default true
 *    panelRole?          - the role of the panel
 *    ariaLabelChildren? - the aria label for the children
 *    ariaLabelPanel?   - the aria label for the panel
 *    focusable         - default true, allows panel to appear on tab navigation
 */
interface HoverPopoverPortalProps {
  children: React.ReactNode;
  panel: React.ReactNode;
  panelId: string;
  direction: Direction;
  portalTargetRef: React.RefObject<HTMLElement>;
  anchorRef?: React.RefObject<HTMLElement>;
  offset?: number;
  offsetPadding?: boolean;
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
  paddingTop: "",
  paddingRight: "",
  paddingBottom: "",
  paddingLeft: "",
  transform: "",
};

export default function HoverPopoverPortal({
  children,
  panel,
  panelId,
  portalTargetRef,
  anchorRef,
  direction,
  offset = 0.0,
  offsetPadding = true,
  shiftRem = 0.0,
  shiftChildPercent = 0,
  shiftPanelPercent = 0,
  fadeEffect = true,
  closingTime = 300,
  boundaryDetection = true,
  panelRole = "dialog",
  ariaLabelChildren = "Hover to reveal more information",
  ariaLabelPanel = "Revealed panel",
  focusable = true,
}: HoverPopoverPortalProps) {
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

  //Adds the panel if the child element is focused or hovered over, removes otherwise
  function updatePanelStatus() {
    const isChildrenFocused = focusable
      ? childrenRef.current?.matches(":focus-visible") ||
        !!childrenRef.current?.querySelector(":focus-visible")
      : false;

    const isPanelFocused =
      panelRef.current?.matches(":focus-visible") ||
      !!panelRef.current?.querySelector(":focus-visible");

    const isChildHovered = childrenRef.current?.matches(":hover");
    const isPanelHovered = panelRef.current?.matches(":hover");
    if (
      isChildrenFocused ||
      isPanelFocused ||
      isChildHovered ||
      isPanelHovered
    ) {
      addPanel();
    } else {
      removePanel();
    }
  }

  //Moves the panel to one of the sides when it becomes active, adds events for positioning
  useEffect(() => {
    if (active) {
      calculatePosition();
      window.addEventListener("scroll", throttledCalculatePosition);
      return () => {
        window.removeEventListener("scroll", throttledCalculatePosition);
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
    if (offset < 0 || !offsetPadding) {
      translates[verticalDirection ? `y` : `x`] =
        side === "top" || side === "left" ? -1 * offset : offset;
    } else {
      // Adds space between the panel and the children
      const oppositeSide = {
        top: "Bottom",
        right: "Left",
        bottom: "Top",
        left: "Right",
      }[side];
      positionCopy[
        `padding${oppositeSide}` as keyof typeof positionCopy
      ] = `${offset}rem`;
    }
    Object.assign(panelRef.current.style, positionCopy);
    let panel = panelRef.current.getBoundingClientRect();
    //Uses a different anchor element if provided (rare when using hover)
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
            if (offset < 0) {
              translates.y += 2 * offset;
            } else {
              positionCopy.paddingTop = positionCopy.paddingBottom;
              positionCopy.paddingBottom = ``;
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
          if (offset < 0) {
            translates.y += offset;
          } else if (offset) {
            positionCopy.paddingLeft = ``;
            positionCopy.paddingRight = ``;
            positionCopy.paddingTop = `${offset}rem`;
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
        onMouseOver={updatePanelStatus}
        onMouseLeave={updatePanelStatus}
        onFocus={focusable ? updatePanelStatus : undefined}
        onBlur={() => setTimeout(updatePanelStatus, 0)}
        className={styles.expandable}
        aria-label={ariaLabelChildren}
        aria-describedby={panelId}
        aria-haspopup={panelRole}
        aria-controls={active ? panelId : undefined}
      >
        {children}
      </div>
      {active &&
        portalTargetRef &&
        createPortal(
          <div
            className={classNames(styles.panel, {
              [styles.appear]: fadeEffect,
              [styles.closing]: closing && fadeEffect,
            })}
            ref={panelRef}
            role={panelRole}
            aria-label={ariaLabelPanel}
            onMouseLeave={updatePanelStatus}
            onBlur={
              focusable ? () => setTimeout(updatePanelStatus, 0) : undefined
            }
            id={panelId}
          >
            {panel}
          </div>,
          portalTargetRef.current as HTMLElement
        )}
    </>
  );
}
