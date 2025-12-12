"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import styles from "./dropdownMenu.module.css";
import classNames from "classnames";

// A menu item that is a link
export interface LinkItem {
  type: "link";
  label: React.ReactNode;
  href: string;
}
// Performs a function when you click on this menu item
export interface ActionItem {
  type: "action";
  label: React.ReactNode;
  onClick: () => void;
}

// Lets us add a divider line or a blank space to our menu
export interface Decoration {
  type: "decoration";
  decoration: "line" | "space";
}
export type Item = LinkItem | ActionItem | Decoration;

/* Used to create each item in the menu
 *  children - wrap a button around a child eleemnt
 *  item - the inputed MenuItem: ActionMenuItem | LinkMenuItem |  DecorationMenuItem;
 *  itemRef - an entry from itemsRef to keep track of actionable items vs decorations
 *  onClose - the function that closes the menu
 *  onCloseAndFocus - the function that closes the menu and focuses the parent
 *  isParentClosing  - boolean if the parent item is closing its descendent menu - needed to avoid refocusing on hover
 *  index - the index we get from the map when creating a menu
 *  parent - a ref to the parent menuItem of this item
 *  siblings - an array ref of the siblings of this item
 *  parentRef - ref to the button that controls the menu
 * */
interface MenuItemProps {
  item: Item;
  itemRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onCloseAndFocus: () => void;
  isParentClosing?: boolean;
  index: number;
  siblings?: React.RefObject<HTMLElement | null>[];
  parentRef?: React.RefObject<HTMLElement | null>;
}
export function Item({
  item,
  itemRef,
  onClose,
  onCloseAndFocus,
  isParentClosing,
  index,
  siblings,
  parentRef,
}: MenuItemProps) {
  const [isActive, setIsActive] = useState(false);

  //Gives time for closing animation to play
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const closingTime = 200;
  useEffect(() => {
    if (closing) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setClosing(false);
      }, closingTime);
    }
  }, [closing]);

  function handleMouseEnter() {
    setIsActive(true);
    if (itemRef.current?.matches(":hover")) {
      itemRef.current.focus();
    }
  }

  function handleMouseLeave() {
    setIsActive(false);
  }

  function handleBlur() {
    const isItemFocused =
      itemRef.current?.matches(":focus") ||
      itemRef.current?.querySelector(":focus");
    if (!isItemFocused) {
      setIsActive(false);
      setClosing(true);
    }
  }

  function handleKeydownItem(
    e: React.KeyboardEvent<HTMLLIElement | HTMLAnchorElement>
  ) {
    if (
      e.key === "ArrowUp" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowDown" ||
      e.key === "ArrowLeft"
    ) {
      e.preventDefault();
    }
    e.stopPropagation();
    if (e.key === "Enter" && item.type === "action") {
      item.onClick();
      onClose();
    } else {
      switch (e.key) {
        case "ArrowDown": {
          if (siblings && index + 1 < siblings.length) {
            setIsActive(false);
            siblings[index + 1].current?.focus();
          }
          break;
        }
        case "ArrowUp": {
          if (index > 0 && siblings) {
            setIsActive(false);
            siblings[index - 1].current?.focus();
          } else {
          }
          break;
        }
        case "Escape": {
          onCloseAndFocus();
          break;
        }
        case "Backspace": {
          onCloseAndFocus();
          break;
        }
        default: {
        }
      }
    }
  }

  // Renders the item
  switch (item.type) {
    case "link":
      return (
        <li className={classNames({ [styles.active]: isActive })}>
          <Link
            tabIndex={0}
            onMouseEnter={() => !isParentClosing && handleMouseEnter()}
            onMouseLeave={handleMouseLeave}
            onBlur={() => setTimeout(handleBlur, 0)}
            onKeyDown={handleKeydownItem}
            ref={itemRef as React.RefObject<HTMLAnchorElement>}
            role="menuitem"
            onClick={() => {
              onClose();
            }}
            href={item.href}
          >
            {item.label}
          </Link>
        </li>
      );
    case "decoration":
      return item.decoration === "line" ? (
        <div className={styles.line} />
      ) : (
        <div className={styles.space} />
      );
    case "action":
      return (
        <li
          role="menuitem"
          tabIndex={0}
          ref={itemRef as React.RefObject<HTMLLIElement>}
          onMouseEnter={() => !isParentClosing && itemRef.current?.focus()}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          onKeyDown={handleKeydownItem}
        >
          <div className={styles.li_content_wrapper}>
            <div className={styles.label}>{item.label}</div>
          </div>
        </li>
      );
    default:
      return null;
  }
}

interface DropdownMenuProps {
  label: React.ReactNode;
  menu: Item[];
  containerRef?: React.RefObject<HTMLElement | null>;
  title?: string;
  buttonStyle?: React.CSSProperties;
}
export default function DropdownMenu({
  label,
  menu,
  containerRef,
  title,
  buttonStyle,
}: DropdownMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const shouldFocusParent = useRef(false);

  //Gives time for closing animation to play
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const closingTime = 200;
  useEffect(() => {
    if (closing) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setMenuOpen(false);
        setClosing(false);
        // Focus button after menu closes if requested
        if (shouldFocusParent.current) {
          buttonRef.current?.focus();
          shouldFocusParent.current = false;
        }
      }, closingTime);
    }
  }, [closing]);
  function openMenu() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setClosing(false);
    setMenuOpen(true);
    buttonRef.current?.focus();
  }

  function closeMenuAndFocus() {
    shouldFocusParent.current = true;
    setClosing(true);
  }

  function closeMenu() {
    setClosing(true);
  }

  function handleBlur(e: React.FocusEvent) {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      closeMenu();
    }
  }

  //Adds event listeners when menu opens, removes them when it closes
  useEffect(() => {
    if (!menuRef.current || !menuOpen) {
      document.removeEventListener("click", handleClick);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }
    if (containerRef && containerRef.current) {
      observerRef.current = new ResizeObserver(() => {
        positionMenu();
      });
      observerRef.current.observe(containerRef.current);
    } else {
      positionMenu();
    }
    document.addEventListener("click", handleClick);
  }, [menuOpen]);

  //Poition the menu so it doesn't go out of bounds
  function positionMenu() {
    if (!menuRef.current || !menuOpen) {
      return;
    }
    const menu = menuRef.current.getBoundingClientRect();
    //This centers the menu but we could position it differently
    const centerTranslate = -menu.width / 2;
    let transform = `translateX(${centerTranslate / 10}rem)`;
    Object.assign(menuRef.current.style, { transform: transform });
    if (containerRef && containerRef.current) {
      const menu = menuRef.current.getBoundingClientRect();
      const container = containerRef.current.getBoundingClientRect();
      const translates = {
        x: 0,
        y: 0,
      };
      if (menu.right > container.right) {
        translates.x += container.right - menu.right;
      }
      if (menu.left + translates.x < container.left) {
        translates.x += container.left - (menu.left + translates.x);
      }
      translates.x += centerTranslate;
      transform = `translateX(${translates.x / 10}rem) translateY(${
        translates.y / 10
      }rem)`;
      Object.assign(menuRef.current.style, { transform: transform });
    }
  }

  //Closes the menu when user clicks something else
  const handleClick = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      closeMenu();
    }
  }, []);

  const actionableIndexes = useRef(
    menu
      .map((item, i) => (item.type !== "decoration" ? i : null))
      .filter((i): i is number => i !== null)
  );

  const itemRefs = useRef(
    actionableIndexes.current.map(() => React.createRef<HTMLElement>())
  );

  function handleButtonKeydown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (menuOpen) {
      e.stopPropagation();
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft"
      ) {
        e.preventDefault();
        if (e.key === "ArrowDown") {
          itemRefs.current[0].current?.focus();
        }
      }
      if (e.key === "Escape" || e.key === "Backspace") {
        closeMenuAndFocus();
      }
    } else {
      // When menu is closed, allow normal button behavior
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
      } else {
        (e.target as HTMLElement).blur();
        return;
      }
    }
  }

  return (
    <div
      className={classNames(styles.dropdown_menu_wrapper, {
        [styles.closing]: closing,
      })}
      onBlur={handleBlur}
    >
      <button
        onClick={() => {
          menuOpen ? closeMenu() : openMenu();
        }}
        onKeyDown={handleButtonKeydown}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        aria-label={`Click to ${menuOpen ? `close` : `open`} dropdown menu`}
        title={title}
        ref={buttonRef}
        style={{ ...buttonStyle }}
      >
        {label}
      </button>
      {menuOpen && (
        <ul
          aria-label="Dropdown menu"
          role="menu"
          className={classNames(styles.dropdown_menu)}
          ref={menuRef}
        >
          {menu.map((item, i) => {
            if (item.type === "decoration") {
              // Renders a decoration without focus/ref
              return item.decoration === "line" ? (
                <div className={styles.line} key={i} />
              ) : (
                <div className={styles.space} key={i} />
              );
            }
            return (
              <Item
                item={item}
                itemRef={itemRefs.current[actionableIndexes.current.indexOf(i)]}
                onClose={() => {
                  closeMenu();
                }}
                onCloseAndFocus={closeMenuAndFocus}
                isParentClosing={closing}
                index={actionableIndexes.current.indexOf(i)}
                siblings={itemRefs.current}
                parentRef={buttonRef}
                key={i}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
