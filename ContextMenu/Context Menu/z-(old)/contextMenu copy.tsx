"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./contextMenu.module.css";
import { FocusTrap } from "focus-trap-react";
import classNames from "classnames";

/*
 *   menu - an inputed menu that has labels, functions, submenus, and decorations. should only have 1 submenu
 *   targetRef - the element the context menu will be attached to
 */
interface ContextMenuProps {
  menu: MenuItem[];
  targetRef: React.RefObject<HTMLElement>;
}

// Performs a function when you click on this menu item
export interface ActionMenuItem {
  type: "action";
  label: string;
  onClick: (e?: React.Event) => void;
}
// Opens a submenu when you click on this menu item
export interface SubmenuMenuItem {
  type: "submenu";
  label: string;
  submenu: MenuItem[];
}
// Lets us add a divider line or a blank space to our menu
export interface DecorationMenuItem {
  type: "decoration";
  decoration: "line" | "blank";
}
export type MenuItem = ActionMenuItem | SubmenuMenuItem | DecorationMenuItem;

//Used to create the menu, the wrapper for the menu items

/*
 * menu - the inputed menu
 * direction - the direction in which the submenu will appear, will become left if theres no room to the right
 */
interface SubMenuPops {
  submenu: MenuItem[];
  direction?: "right" | "left";
  closeFunction: () => void;
}

export function SubMenu({ submenu, direction, closeFunction }: SubMenuPops) {
  const menuRef = useRef<HTMLUListElement | null>(null);
  const [translateY, setTranslateY] = useState<number>(0);

  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    let offsetY = 0;
    if (rect.bottom > window.innerHeight) {
      offsetY = window.innerHeight - rect.bottom - 6;
    }
    if (rect.top + offsetY < 0) {
      offsetY = -rect.top + 6;
    }
    setTranslateY(offsetY);
  }, []);

  return (
    <ul
      ref={menuRef}
      className={classNames(styles.context_menu, styles.submenu, {
        [styles.left]: direction === "left",
      })}
      style={{
        transform: `translateY(${translateY / 10}rem)`,
      }}
      role="menu"
    >
      {submenu.map((item, i) => {
        return (
          <MenuItem
            item={item}
            closeFunction={closeFunction}
            direction={direction}
            key={i}
          />
        );
      })}
    </ul>
  );
}

//Used to create each item in the menu
interface MenuItemProps {
  item: MenuItem;
  closeFunction: () => void;
  direction?: "right" | "left";
}
export function MenuItem({ item, closeFunction, direction }: MenuItemProps) {
  const [submenu, setSubmenu] = useState(false);
  const itemRef = useRef<HTMLLIElement | null>(null);

  function updateSubmenu() {
    const isItemFocused =
      itemRef.current?.matches(":focus-visible") ||
      itemRef.current?.querySelector(":focus-visible");
    const isItemHovered =
      itemRef.current?.matches(":hover") ||
      itemRef.current?.querySelector(":hover");
    isItemFocused || isItemHovered ? setSubmenu(true) : setSubmenu(false);
  }

  return item.type === "decoration" ? (
    item.decoration === "line" ? (
      <div className={styles.line}></div>
    ) : (
      <div className={styles.blank}></div>
    )
  ) : item.type === "submenu" ? (
    <li
      tabIndex={0}
      onMouseOver={updateSubmenu}
      onMouseLeave={updateSubmenu}
      onFocus={updateSubmenu}
      onBlur={() => setTimeout(updateSubmenu, 0)}
      className={classNames({
        [styles.submenu_open]: submenu,
        [styles.flip_arrow]: direction === "left",
      })}
      ref={itemRef}
      role="menuitem"
      aria-haspopup="true"
      aria-expanded={submenu}
    >
      <div>
        <div className={styles.label}>{item.label}</div>
        {item.type === "submenu" && rightArrow}
      </div>
      {submenu && item.type === "submenu" && (
        <SubMenu
          submenu={item.submenu}
          direction={direction}
          closeFunction={closeFunction}
        />
      )}
    </li>
  ) : (
    <li
      role="menuitem"
      tabIndex={0}
      ref={itemRef}
      onClick={() => {
        item.onClick();
        closeFunction();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          item.onClick();
          closeFunction();
        }
      }}
    >
      <div>
        <div className={styles.label}>{item.label}</div>
      </div>
    </li>
  );
}

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

//Used to create the context menu using the Menu and its MenuItems
export default function ContextMenu({ menu, targetRef }: ContextMenuProps) {
  const menuRef = useRef<HTMLUListElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | undefined>();

  const position = useRef({
    x: 0,
    y: 0,
  });
  function setPosition(x: number, y: number) {
    position.current.x = x;
    position.current.y = y;
  }

  useEffect(() => {
    if (!menuRef.current) {
      document.body.style.overflow = "";
      return;
    }
    const rect = menuRef.current.getBoundingClientRect();
    document.body.style.overflow = "hidden";
    const translates = {
      x: 0,
      y: 0,
    };
    let translateX = 0;
    if (rect.right > window.innerWidth) {
      translateX = window.innerWidth - rect.right - 6;
      setDirection("left");
    }
    if (rect.left + translateX < 0) {
      translateX - rect.left + 6;
    }
    translates.x += translateX / 10;

    let translateY = 0;
    if (rect.bottom > window.innerHeight) {
      translateY = window.innerHeight - rect.bottom - 6;
    }
    if (rect.top + translateY < 0) {
      translateY - rect.top + 6;
    }
    translates.y += translateY / 10;
    let transform = `translateX(${translates.x}rem) translateY(${translates.y}rem)`;
    Object.assign(menuRef.current.style, { transform: transform });
    rect.right + rect.width > window.innerWidth
      ? setDirection("left")
      : setDirection("right");
  }, [visible]);

  //Gives the target the contextMenu event, and ways to close the menu
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setPosition(e.clientX + 8, e.clientY);
      setVisible(true);
    };
    const handleResize = () => setVisible(false);
    window.addEventListener("resize", handleResize);
    target.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    window.addEventListener("keydown", escapeKey);
    return () => {
      target.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", escapeKey);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  //Closes the menu when user hits Escape
  const escapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setVisible(false);
    }
  }, []);

  //Closes the menu when user clicks something
  const handleClick = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setVisible(false);
    }
  }, []);

  return (
    visible && (
      <FocusTrap
        focusTrapOptions={{
          preventScroll: true,
          escapeDeactivates: true,
          clickOutsideDeactivates: true,
        }}
      >
        <ul
          aria-label="Context menu"
          role="menu"
          className={classNames(styles.context_menu, styles.fixed)}
          ref={menuRef}
          style={{
            top: position.current.y,
            left: position.current.x,
          }}
        >
          {menu.map((item, i) => {
            return (
              <MenuItem
                item={item}
                key={i}
                closeFunction={() => setVisible(false)}
                direction={direction}
              />
            );
          })}
        </ul>
      </FocusTrap>
    )
  );
}
