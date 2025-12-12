"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import styles from "./clickPopover.module.css";
import classNames from "classnames";
import { throttle } from "lodash";
import { FocusTrap } from "focus-trap-react";

/*  Displays a popover panel when you click over an element
 *    children       - the elements which the click event will be given to
 *    panel          - the inputed panel that will be displayed on click
 *    panelId?        - id for the panel, also used in aria-describedBy
 *    direction      - the direction which the panel will be anchored to
 *    offset         - adds a gap between the children and the panel, in rem (can be negative also)
 *    shiftRem?      - shifts the panel in rem
 *    shiftChildPercent?  - shifts the panel, by a percent of the children's width / height
 *    shiftPanelPercent? - shifts the panel, by a percent of the panel's width / height
 *    fadeEffect?    - plays the default fade in / out animation, default true
 *    closingTime?    - the time it takes for the panel to close, in ms
 *    panelRole?          - the role of the panel
 *    ariaLabelChildren? - the aria label for the children
 *    ariaLabelPanel?   - the aria label for the panel
 *    containerRef   - confines the panel to the boundaries of a container
 *    focusable?        - default true, allows the component to be tab focused like a button
 *    focusTrap?      - default true, will place a focus trap on the panel (not needed as badly in this version due to relative positioning)
 */
interface ClickPopoverProps {
  children: React.ReactNode;
  panel: React.ReactNode;
  panelId: string;
  direction: Direction;
  offset?: number;
  shiftRem?: number;
  shiftChildPercent?: number;
  shiftPanelPercent?: number;
  fadeEffect?: boolean;
  closingTime?: number;
  panelRole?: "dialog" | "menu";
  ariaLabelChildren?: string;
  ariaLabelPanel?: string;
  containerRef?: React.RefObject<HTMLElement>;
  focusable?: boolean;
  focusTrap?: boolean;
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
  top: "",
  right: "",
  bottom: "",
  left: "",
  transform: "",
};

export default function ClickPopover({
  children,
  panel,
  panelId,
  direction,
  offset = 0.0,
  shiftRem = 0.0,
  shiftChildPercent = 0,
  shiftPanelPercent = 0,
  fadeEffect = true,
  ariaLabelChildren = "Click to reveal more information",
  ariaLabelPanel = "Revealed panel",
  panelRole = "dialog",
  closingTime = 300,
  containerRef,
  focusable = true,
  focusTrap = true,
}: ClickPopoverProps) {
  const [active, setActive] = useState(false);
  const [closing, setClosing] = useState(false);

  const childrenRef = useRef<null | HTMLDivElement>(null);
  const panelRef = useRef<null | HTMLDivElement>(null);

  const [position, setPosition] = useState(positionObject);

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
      window.addEventListener("keydown", escapeKey);
      if (containerRef) {
        window.addEventListener("scroll", throttledCalculatePosition);
        return () => {
          window.removeEventListener("scroll", throttledCalculatePosition);
          document.removeEventListener("click", handleClick);
          window.removeEventListener("keydown", escapeKey);
        };
      } else {
        return () => {
          document.removeEventListener("click", handleClick);
          window.removeEventListener("keydown", escapeKey);
        };
      }
    }
  }, [active]);

  // Calculates the position of the panel when the window is resized
  const throttledCalculatePosition = useCallback(
    throttle(() => {
      calculatePosition();
    }, 100),
    []
  );

  // Watches the container for changes in size, and recalculates the position
  useEffect(() => {
    if (!containerRef?.current) return;
    const observer = new ResizeObserver(() => {
      calculatePosition();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  //Calculate the position for the panel to appear
  function calculatePosition() {
    const positionCopy = { ...positionObject };
    const { side, align } = parseDirection(direction);
    // Boolean to check if panel appears vertically or horizontally
    const verticalDirection = side === "top" || side === "bottom";

    const translates = {
      remX: 0,
      remY: 0,
      percentX: 0,
      percentY: 0,
    };

    if (offset) {
      translates[verticalDirection ? `remY` : `remX`] +=
        side === "top" || side === "left" ? -1 * offset : offset;
    }

    // Moves the panel to one of the sides
    positionCopy[side] = `0rem`;
    translates[verticalDirection ? `percentY` : `percentX`] +=
      side === "top" || side === "left" ? -100 : 100;

    if (align === "middle") {
      // Aligns the panel to the center
      positionCopy[verticalDirection ? `left` : `top`] = `${
        50 + shiftChildPercent
      }%`;
      translates[verticalDirection ? `percentX` : `percentY`] += -50;
    } else {
      // Aligns the panel to a side
      positionCopy[align] = `${
        (align === "top" || align === "left" ? 1 : -1) * shiftChildPercent
      }%`;
    }

    // Shifts the panel
    if (shiftRem) {
      translates[verticalDirection ? `remX` : `remY`] += shiftRem;
    }

    if (shiftPanelPercent) {
      translates[verticalDirection ? `percentX` : `percentY`] +=
        shiftPanelPercent;
    }
    positionCopy.transform = `translateX(${translates.remX}rem) translateY(${translates.remY}rem) translateX(${translates.percentX}%) translateY(${translates.percentY}%)`;

    // Moves panel if it goes outside the container's bounds
    if (containerRef) {
      if (!panelRef.current || !childrenRef.current || !containerRef.current)
        return;
      Object.assign(panelRef.current.style, positionCopy);
      const child = childrenRef.current.getBoundingClientRect();
      const container = containerRef.current.getBoundingClientRect();
      const panel = panelRef.current.getBoundingClientRect();

      if (verticalDirection) {
        //Moves panel to the bottom if it goes out of bounds to the top
        if (side === "top") {
          if (panel.top < container.top || panel.top < -child.height / 8) {
            translates[`percentY`] += 200;
            positionCopy.top = "";
            positionCopy.bottom = "0";
            if (offset) {
              translates[`remY`] += 2 * offset;
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
        translates[`remX`] += translateX / 10;
      } else {
        // Moves panel to the bottom if it goes out of bounds to right / left
        if (panel.left < container.left || panel.right > container.right) {
          positionCopy.left = ``;
          positionCopy.right = ``;
          positionCopy.bottom = `0`;
          translates[`remX`] = 0;
          translates[`remY`] = 0;
          translates[`percentX`] = -50;
          translates[`percentY`] = 100;
          positionCopy[`left`] = `50%`;
          if (offset) {
            translates[`remY`] += offset;
          }
          positionCopy.transform = `translateX(${translates.remX}rem) translateY(${translates.remY}rem) translateX(${translates.percentX}%) translateY(${translates.percentY}%)`;
          Object.assign(panelRef.current.style, positionCopy);
          const panel = panelRef.current.getBoundingClientRect();
          let translateX = 0;
          if (panel.right > container.right) {
            translateX = container.right - panel.right;
          }
          if (panel.left + translateX < container.left) {
            translateX = container.left - panel.left;
          }
          translates[`remX`] += translateX / 10;
        } else {
          // Moves panel up / down if it goes out of bounds to top / bottom
          let translateY = 0;
          if (panel.bottom > container.bottom) {
            translateY = container.bottom - panel.bottom;
          }
          if (panel.top + translateY < container.top) {
            translateY = container.top - panel.top;
          }
          translates[`remY`] += translateY / 10;
        }
      }
      positionCopy.transform = `translateX(${translates.remX}rem) translateY(${translates.remY}rem) translateX(${translates.percentX}%) translateY(${translates.percentY}%)`;
      Object.assign(panelRef.current.style, positionCopy);
    } else {
      setPosition(positionCopy);
    }
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

  const panelWrapper = (
    <div
      className={classNames(styles.panel, {
        [styles.appear]: fadeEffect,
        [styles.closing]: closing && fadeEffect,
      })}
      ref={panelRef}
      role={panelRole}
      aria-label={ariaLabelPanel}
      style={position}
      id={panelId}
    >
      {panel}
    </div>
  );

  return (
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
      {active &&
        (focusTrap ? (
          <FocusTrap
            focusTrapOptions={{
              preventScroll: true,
              escapeDeactivates: true,
              clickOutsideDeactivates: true,
            }}
          >
            {panelWrapper}
          </FocusTrap>
        ) : (
          panelWrapper
        ))}
    </div>
  );
}
