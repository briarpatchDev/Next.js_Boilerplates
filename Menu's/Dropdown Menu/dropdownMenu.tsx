"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./dropdownMenu.module.css";
import { useRouter } from "next/navigation";
import classNames from "classnames";

const rightArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 80.593 122.88"
    className={styles.right_arrow}
  >
    <path d="M0 0h30.82l49.773 61.44-49.773 61.44H0l49.772-61.44L0 0z" />
  </svg>
);

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
  onClick: (e?: React.MouseEvent) => void;
}
// Opens a submenu when you click on this menu item
export interface SubmenuItem {
  type: "submenu";
  label: React.ReactNode;
  submenu: Item[];
}
// Lets us add a divider line or a blank space to our menu
export interface Decoration {
  type: "decoration";
  decoration: "line" | "space";
}
export type Item = LinkItem | ActionItem | SubmenuItem | Decoration;

/* Used to create each item in the menu
 *  item - the inputed MenuItem: ActionMenuItem | SubmenuMenuItem | DecorationMenuItem;
 *  itemRef - an entry from itemsRef to keep track of actionable items vs decorations
 *  isClosing - true when the submenu is closing, prevents menu from reopening
 *  onClose - the functions that hides visibility
 *  onCloseAndFocus - function that refocuses original button when user ESC's the menu
 *  index - the index we get from the map when creating a submenu of menuItems
 *  parent - a ref to the parent menuItem of this item
 *  closing - true if the menu the item is in is closing
 *  siblings - an array ref of the siblings of this item
 *  direction - the direction the menu will face in (affects arrows and keyboard inputs)
 * */
interface MenuItemProps {
  item: Item;
  itemRef: React.RefObject<HTMLLIElement>;
  isClosing: boolean;
  onClose: () => void;
  onCloseAndFocus: () => void;
  index: number;
  parent?: React.RefObject<HTMLLIElement>;
  siblings?: React.RefObject<HTMLLIElement>[];
  direction?: "right" | "left";
}
export function Item({
  item,
  itemRef,
  isClosing,
  onClose,
  onCloseAndFocus,
  index,
  parent,
  siblings,
  direction,
}: MenuItemProps) {
  const router = useRouter();
  const [submenu, setSubmenu] = useState(false);
  const [isActive, setIsActive] = useState(false);

  //Gives time for closing animation to play
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const closingTime = 150;
  useEffect(() => {
    if (closing) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setSubmenu(false);
        setClosing(false);
      }, closingTime);
    }
  }, [closing]);
  function openMenu() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setClosing(false);
    setSubmenu(true);
  }

  let itemsRef: React.RefObject<HTMLLIElement>[] | undefined;
  if (item.type === "submenu") {
    itemsRef = item.submenu.map((item) => React.createRef<HTMLLIElement>());
  }
  const submenuContainerRef = useRef<HTMLDivElement | null>(null);

  function updateSubmenu() {
    const isItemFocused =
      itemRef.current?.matches(":focus") ||
      itemRef.current?.querySelector(":focus");
    isItemFocused ? openMenu() : setClosing(true);
  }

  function handleMouseEnter() {
    setIsActive(true);
    if (
      itemRef.current?.matches(":hover") &&
      !submenuContainerRef.current?.matches(":hover") &&
      !isClosing
    ) {
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

  const openKey = direction === "left" ? "ArrowLeft" : "ArrowRight";
  const backKey = direction === "left" ? "ArrowRight" : "ArrowLeft";

  function handleKeydownAction(e: React.KeyboardEvent<HTMLLIElement>) {
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
          }
          break;
        }
        case backKey: {
          if (parent && parent.current) {
            parent.current.focus();
          }
          break;
        }
        case "Escape": {
          onCloseAndFocus();
          break;
        }
        case "Backspace": {
          if (parent && parent.current) {
            // In a submenu - go back to parent
            parent.current.focus();
          } else {
            // At top level - close entirely
            onCloseAndFocus();
          }
          break;
        }
        default: {
        }
      }
    }
  }

  function handleKeydownSubmenu(e: React.KeyboardEvent<HTMLLIElement>) {
    if (
      e.key === "ArrowUp" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowDown" ||
      e.key === "ArrowLeft"
    ) {
      e.preventDefault();
    }
    e.stopPropagation();
    switch (e.key) {
      case "ArrowDown": {
        if (siblings && index + 1 < siblings.length) {
          siblings[index + 1].current?.focus();
        }
        break;
      }
      case "ArrowUp": {
        if (index > 0 && siblings) {
          siblings[index - 1].current?.focus();
        }
        break;
      }
      case openKey: {
        if (itemsRef) itemsRef[0].current?.focus();
        break;
      }
      case backKey: {
        if (parent && parent.current) {
          parent.current.focus();
        }
        break;
      }
      case "Enter": {
        if (itemsRef) itemsRef[0].current?.focus();
        break;
      }
      case "Escape": {
        onCloseAndFocus();
        break;
      }
      case "Backspace": {
        if (parent && parent.current) {
          // In a submenu - go back to parent
          parent.current.focus();
        } else {
          // At top level - close entirely
          onCloseAndFocus();
        }
        break;
      }
      default: {
      }
    }
  }

  function handleKeydownLink(
    e: React.KeyboardEvent<HTMLLIElement>,
    href: string
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
        }
        break;
      }
      case "Enter": {
        router.push(href);
      }
      case backKey: {
        if (parent && parent.current) {
          parent.current.focus();
        }
        break;
      }
      case "Escape": {
        onCloseAndFocus();
        break;
      }
      case "Backspace": {
        if (parent && parent.current) {
          // In a submenu - go back to parent
          parent.current.focus();
        } else {
          // At top level - close entirely
          onCloseAndFocus();
        }
        break;
      }
      default: {
      }
    }
  }

  // Renders the item
  switch (item.type) {
    case "link":
      return (
        <li
          className={classNames({ [styles.active]: isActive })}
          tabIndex={0}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onBlur={() => setTimeout(handleBlur, 0)}
          onKeyDown={(e) => handleKeydownLink(e, item.href)}
          ref={itemRef}
          role="menuitem"
          aria-label={`Click or press Enter to go to "${item.label}"`}
        >
          <Link href={item.href} tabIndex={-1}>
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
    case "submenu":
      return (
        <li
          tabIndex={0}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={updateSubmenu}
          onFocus={() => setTimeout(updateSubmenu, 0)}
          onBlur={() => setTimeout(handleBlur, 0)}
          onKeyDown={handleKeydownSubmenu}
          className={classNames({
            [styles.active]: isActive,
            [styles.submenu_open]: submenu,
            [styles.flip_arrow]: direction === "left",
            [styles.closing]: closing,
          })}
          ref={itemRef}
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={submenu}
        >
          <div className={styles.li_content_wrapper}>
            <div className={styles.label}>{item.label}</div>
            {rightArrow}
          </div>
          <div ref={submenuContainerRef}>
            {submenu && item.type === "submenu" && (
              <SubMenu
                submenu={item.submenu}
                parent={itemRef}
                itemRefs={itemsRef ?? []}
                direction={direction}
                isClosing={closing}
                onClose={onClose}
                onCloseAndFocus={onCloseAndFocus}
              />
            )}
          </div>
        </li>
      );
    case "action":
      return (
        <li
          className={classNames({ [styles.active]: isActive })}
          role="menuitem"
          tabIndex={0}
          ref={itemRef}
          onMouseEnter={() => {
            setIsActive(true);
            itemRef.current?.focus();
          }}
          onMouseLeave={handleMouseLeave}
          onBlur={() => setTimeout(handleBlur, 0)}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          onKeyDown={handleKeydownAction}
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

//Used to create the menu, the wrapper for the menu items
/*
 * submenu - the inputed menu
 * parent - ref to the item above the submenu
 * direction - the direction in which the submenu will appear, will become left if theres no room to the right
 */
interface SubMenuPops {
  submenu: Item[];
  itemRefs: React.RefObject<HTMLLIElement>[];
  parent?: React.RefObject<HTMLLIElement>;
  direction?: "right" | "left";
  isClosing: boolean;
  onClose: () => void;
  onCloseAndFocus: () => void;
}
export function SubMenu({
  submenu,
  itemRefs,
  parent,
  direction,
  isClosing,
  onClose,
  onCloseAndFocus,
}: SubMenuPops) {
  const menuRef = useRef<HTMLUListElement | null>(null);

  const actionableIndexes = useRef(
    submenu
      .map((item, i) => (item.type !== "decoration" ? i : null))
      .filter((i): i is number => i !== null)
  );

  return (
    <ul
      ref={menuRef}
      className={classNames(styles.dropdown_menu, styles.submenu, {
        [styles.left]: direction === "left",
      })}
      role="menu"
    >
      {submenu.map((item, i) => {
        if (item.type === "decoration") {
          return item.decoration === "line" ? (
            <div className={styles.line} key={i} />
          ) : (
            <div className={styles.space} key={i} />
          );
        }
        return (
          <Item
            item={item}
            isClosing={isClosing}
            onClose={onClose}
            onCloseAndFocus={onCloseAndFocus}
            direction={direction}
            parent={parent}
            siblings={itemRefs}
            itemRef={itemRefs[actionableIndexes.current.indexOf(i)]}
            index={actionableIndexes.current.indexOf(i)}
            key={i}
          />
        );
      })}
    </ul>
  );
}

interface DropdownMenuProps {
  label: React.ReactNode;
  menu: Item[];
  containerRef?: React.RefObject<HTMLElement>;
  buttonStyle?: React.CSSProperties;
}
export default function DropdownMenu({
  label,
  menu,
  containerRef,
  buttonStyle,
}: DropdownMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | undefined>();
  const menuRef = useRef<HTMLUListElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const shouldFocusParent = useRef(false);

  //Gives time for closing animation to play
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const closingTime = 150;
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

  //Adds event listeners when menu opens, removes them when it closes
  useEffect(() => {
    if (!menuRef.current || !menuOpen) {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", escapeKey);
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
    window.addEventListener("keydown", escapeKey);
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
      menu.right + menu.width > container.right &&
      menu.left - menu.width > container.left
        ? setDirection("left")
        : setDirection("right");
    }
  }

  //Closes the menu when user hits Escape
  const escapeKey = useCallback(
    (e: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenuAndFocus();
      }
    },
    []
  );

  //Closes the menu when user clicks something else
  const handleClick = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setClosing(true);
    }
  }, []);

  const actionableIndexes = useRef(
    menu
      .map((item, i) => (item.type !== "decoration" ? i : null))
      .filter((i): i is number => i !== null)
  );

  const itemRefs = useRef(
    actionableIndexes.current.map(() => React.createRef<HTMLLIElement>())
  );

  function handleButtonKeydown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (
      e.key === "ArrowUp" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowDown" ||
      e.key === "ArrowLeft"
    ) {
      e.preventDefault();
    }
    if (e.key === "ArrowDown") {
      itemRefs.current[0].current?.focus();
    }
    if (e.key === "Escape" || e.key === "Backspace") {
      closeMenuAndFocus();
    }
  }

  return (
    <div
      className={classNames(styles.dropdown_menu_wrapper, {
        [styles.closing]: closing,
      })}
    >
      <button
        onClick={() => {
          menuOpen ? closeMenu() : openMenu();
        }}
        onKeyDown={handleButtonKeydown}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        aria-label={`Click to ${menuOpen ? `close` : `open`} dropdown menu`}
        ref={buttonRef}
        style={buttonStyle}
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
                isClosing={closing}
                onClose={() => setClosing(true)}
                onCloseAndFocus={closeMenuAndFocus}
                direction={direction}
                index={actionableIndexes.current.indexOf(i)}
                siblings={itemRefs.current}
                key={i}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
