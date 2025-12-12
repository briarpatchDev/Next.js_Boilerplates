"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";
import styles from "./contextMenu.module.css";
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

// Performs a function when you click on this menu item
export interface ActionItem {
  type: "action";
  label: React.ReactNode;
  onClick: () => void;
}
// Opens a submenu when you click on this menu item
export interface SubmenuItem {
  type: "submenu";
  label: React.ReactNode;
  submenu: Item[];
}
// Lets us add a divider line or a blank space to our menu
export interface DecorationItem {
  type: "decoration";
  decoration: "line" | "space";
}
export type Item = ActionItem | SubmenuItem | DecorationItem;

/* Used to create each item in the menu
 *  item - the inputed MenuItem: ActionMenuItem | SubmenuMenuItem | DecorationMenuItem;
 *  itemRef - an entry from itemsRef to keep track of actionable items vs decorations
 *  closeFunction - the functions that hides visibility
 *  index - the index we get from the map when creating a submenu of menuItems
 *  parent - a ref to the parent menuItem of this item
 *  siblings - an array ref of the siblings of this item
 *  direction - the direction the menu will face in (affects arrows and keyboard inputs)
 * */
interface MenuItemProps {
  item: Item;
  itemRef: React.RefObject<HTMLLIElement>;
  closeFunction: () => void;
  index: number;
  parent?: React.RefObject<HTMLLIElement>;
  siblings?: React.RefObject<HTMLLIElement>[];
  direction?: "right" | "left";
}
export function Item({
  item,
  itemRef,
  closeFunction,
  index,
  parent,
  siblings,
  direction,
}: MenuItemProps) {
  const [submenu, setSubmenu] = useState(false);
  const [isActive, setIsActive] = useState(false);

  let itemsRef: React.RefObject<HTMLLIElement>[] | undefined;
  if (item.type === "submenu") {
    itemsRef = item.submenu.map((item) => React.createRef<HTMLLIElement>());
  }
  const submenuContainerRef = useRef<HTMLDivElement | null>(null);

  function updateSubmenu() {
    const isItemFocused =
      itemRef.current?.matches(":focus-visible") ||
      itemRef.current?.querySelector(":focus-visible");

    isItemFocused ? setSubmenu(true) : setSubmenu(false);
  }

  function handleMouseEnter() {
    setIsActive(true);
    if (
      itemRef.current?.matches(":hover") &&
      !submenuContainerRef.current?.matches(":hover")
    ) {
      itemRef.current.focus();
    }
  }

  function handleMouseLeave() {
    setIsActive(false);
  }

  function handleBlur() {
    const isItemFocused =
      itemRef.current?.matches(":focus-visible") ||
      itemRef.current?.querySelector(":focus-visible");
    if (!isItemFocused) {
      setIsActive(false);
      setSubmenu(false);
    }
  }

  const openKey = direction === "left" ? "ArrowLeft" : "ArrowRight";
  const backKey = direction === "left" ? "ArrowRight" : "ArrowLeft";

  function handleKeydownAction(e: React.KeyboardEvent<HTMLLIElement>) {
    e.stopPropagation();
    if (e.key === "Enter" && item.type === "action") {
      item.onClick();
      closeFunction();
    } else {
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
        case backKey: {
          if (parent && parent.current) {
            parent.current.focus();
          }
          break;
        }
        case "Escape": {
          closeFunction();
          break;
        }
        case "Backspace": {
          if (parent && parent.current) {
            // In a submenu - go back to parent
            parent.current.focus();
          } else {
            // At top level - close entirely
            closeFunction();
          }
          break;
        }
        default: {
        }
      }
    }
  }

  function handleKeydownSubmenu(e: React.KeyboardEvent<HTMLLIElement>) {
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
        closeFunction();
        break;
      }
      case "Backspace": {
        if (parent && parent.current) {
          // In a submenu - go back to parent
          parent.current.focus();
        } else {
          // At top level - close entirely
          closeFunction();
        }
        break;
      }
      default: {
      }
    }
  }

  return item.type === "decoration" ? (
    item.decoration === "line" ? (
      <div className={styles.line} />
    ) : (
      <div className={styles.space} />
    )
  ) : item.type === "submenu" ? (
    <li
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        handleMouseLeave();
        updateSubmenu();
      }}
      onFocus={updateSubmenu}
      onBlur={() => setTimeout(handleBlur, 0)}
      onKeyDown={handleKeydownSubmenu}
      className={classNames({
        [styles.active]: isActive,
        [styles.submenu_open]: submenu,
        [styles.flip_arrow]: direction === "left",
      })}
      ref={itemRef}
      role="menuitem"
      aria-haspopup="true"
      aria-expanded={submenu}
    >
      <div className={styles.li_content_wrapper}>
        <div className={styles.label}>{item.label}</div>
        {item.type === "submenu" && rightArrow}
      </div>
      <div ref={submenuContainerRef}>
        {submenu && item.type === "submenu" && (
          <SubMenu
            submenu={item.submenu}
            parent={itemRef}
            itemRefs={itemsRef ?? []}
            direction={direction}
            closeFunction={closeFunction}
          />
        )}
      </div>
    </li>
  ) : (
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
        closeFunction();
      }}
      onKeyDown={handleKeydownAction}
    >
      <div className={styles.li_content_wrapper}>
        <div className={styles.label}>{item.label}</div>
      </div>
    </li>
  );
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
  closeFunction: () => void;
}
export function SubMenu({
  submenu,
  itemRefs,
  parent,
  direction,
  closeFunction,
}: SubMenuPops) {
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

  const actionableIndexes = useRef(
    submenu
      .map((item, i) => (item.type !== "decoration" ? i : null))
      .filter((i): i is number => i !== null)
  );

  // Update ref when submenu changes
  actionableIndexes.current = submenu
    .map((item, i) => (item.type !== "decoration" ? i : null))
    .filter((i): i is number => i !== null);

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
            closeFunction={closeFunction}
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

/*
 *   menu - an inputed menu that has labels, functions, submenus, and decorations. should only have 1 submenu
 *   targetRef - the element the context menu will be attached to
 */
interface ContextMenuProps {
  menu: Item[];
  targetRef: React.RefObject<HTMLElement>;
}

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
    window.addEventListener("keydown", handleArrowDown);
    return () => {
      target.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", escapeKey);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleArrowDown);
    };
  }, []);

  function closeMenu() {
    setVisible(false);
  }

  //Focuses the first menu item if you hit arrow down if nothing else is focused
  function handleArrowDown(e: globalThis.KeyboardEvent) {
    const isMenuFocused =
      menuRef.current?.matches(":focus-visible") ||
      menuRef.current?.querySelector(":focus-visible");
    if (e.key === "ArrowDown" && !isMenuFocused) {
      itemRefs.current[0].current?.focus();
    }
  }

  //Closes the menu when user hits Escape
  const escapeKey = useCallback(
    (e: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    },
    []
  );

  //Closes the menu when user clicks something
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

  // Update ref when menu changes
  actionableIndexes.current = menu
    .map((item, i) => (item.type !== "decoration" ? i : null))
    .filter((i): i is number => i !== null);

  const itemRefs = useRef(
    actionableIndexes.current.map(() => React.createRef<HTMLLIElement>())
  );

  return (
    visible && (
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
              closeFunction={closeMenu}
              direction={direction}
              index={actionableIndexes.current.indexOf(i)}
              siblings={itemRefs.current}
              key={i}
            />
          );
        })}
      </ul>
    )
  );
}
