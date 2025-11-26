"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { createFocusTrap } from "focus-trap";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";
import { useClickOff } from "@/app/hooks/useClickOff";

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Forum", href: "/forum" },
  {
    label: "Store",
    links: [
      {
        label: "Food",
        links: [
          {
            label: "Meat",
            links: [
              { label: "Beef", href: "/store/food/meat/beef" },
              { label: "Chicken", href: "/store/food/meat/chicken" },
              { label: "Pork", href: "/store/food/meat/pork" },
              { label: "Turkey", href: "/store/food/meat/turkey" },
              {
                label: "Specialty",
                href: "/store/food/meat/specialty",
              },
            ],
          },
          {
            label: "Seafood",
            links: [
              { label: "Fillets", href: "/store/food/seafood/fillets" },
              { label: "Salmon", href: "/store/food/seafood/salmon" },
              { label: "Tuna", href: "/store/food/seafood/tuna" },
              { label: "Shrimp", href: "/store/food/seafood/shrimp" },
              {
                label: "Shellfish",
                href: "/store/food/seafood/shellfish",
              },
              {
                label: "Specialty",
                href: "/store/food/seafood/specialty",
              },
            ],
          },
          { label: "Fruits", href: "/store/food/fruits" },
          { label: "Vegetables", href: "/store/food/vegetables" },
          { label: "Deli", href: "/store/food/deli" },
          { label: "Bakery", href: "/store/food/bakery" },
          { label: "Snacks", href: "/store/food/snacks" },
          { label: "Frozen", href: "/store/food/frozen" },
        ],
      },
      {
        label: "Drinks",
        links: [
          { label: "Milk", href: "/store/drinks/milk" },
          { label: "Juice", href: "/store/drinks/juice" },
          { label: "Tea", href: "/store/drinks/tea" },
          { label: "Coffee", href: "/store/drinks/coffee" },
          {
            label: "Soft Drinks",
            href: "/store/drinks/soft-drinks",
          },
        ],
      },
      { label: "Clothes", href: "/store/clothes" },
      { label: "Electronics", href: "/store/electronics" },
      { label: "Pharmacy", href: "/store/pharmacy" },
    ],
  },
  {
    label: "Games",
    links: [
      { label: "Action", href: "/games/action" },
      { label: "Arcade", href: "/games/arcade" },
      { label: "Platformer", href: "/games/platformer" },
      { label: "Puzzle", href: "/games/puzzle" },
      { label: "Roleplaying", href: "/games/roleplaying" },
      { label: "Strategy", href: "/games/strategy" },
    ],
  },
  { label: "Contact", href: "/contact" },
  { label: "Extras", href: "/extras" },
  { label: "Login", href: "/login" },
];

//Breakpoint for media query
const breakpoint = 800;

interface NavItem {
  label: string;
  href?: string;
  links?: NavItem[];
}

interface NavItemProps {
  navItem: NavItem;
  closeMenu?: () => void;
  closeSubmenu?: () => void;
}

//Creates one NavItem thats on the navbar menu, lets us have descending menus through recursion
function NavItem({
  navItem,
  closeMenu,
  closeSubmenu,
}: NavItemProps): JSX.Element {
  const arrow = (
    <svg
      className={styles.menuArrow}
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      viewBox="0 0 122.88 122.88"
    >
      <path d="M0 0h30.82l49.773 61.44-49.773 61.44H0l49.772-61.44L0 0z" />
    </svg>
  );
  const [submenuOpen, setSubmenuOpen] = useState<boolean>(false);
  const pathName: string = usePathname();
  const componentRef = useRef<HTMLLIElement | null>(null);

  useBreakpoint({
    breakpoint: breakpoint,
    onAbove: () => setSubmenuOpen(false),
    active: submenuOpen,
  });
  useClickOff({
    ref: componentRef,
    onClickOff: () => setSubmenuOpen(false),
    active: submenuOpen,
  });

  return navItem.href ? (
    <li
      ref={componentRef}
      className={classNames(styles.navItem, {
        [styles.active]: pathName === navItem.href,
      })}
    >
      <Link
        href={navItem.href}
        onClick={() => {
          closeMenu?.();
          closeSubmenu?.();
        }}
      >
        {navItem.label}
      </Link>
    </li>
  ) : !submenuOpen ? (
    <li
      ref={componentRef}
      className={classNames(styles.navItem, {
        [styles.active]: pathName === navItem.href,
      })}
    >
      <button
        className={styles.submenuButton}
        onClick={() => {
          setSubmenuOpen(!submenuOpen);
        }}
      >
        <div>{navItem.label}</div>
        <div className={styles.menuArrowClosed}>{arrow}</div>
      </button>
    </li>
  ) : (
    <li
      ref={componentRef}
      className={classNames(styles.navItem, {
        [styles.active]: pathName === navItem.href,
      })}
    >
      <button
        className={styles.submenuButton}
        onClick={() => {
          setSubmenuOpen(!submenuOpen);
        }}
      >
        <div>{navItem.label}</div>
        <div className={styles.menuArrowOpen}>{arrow}</div>
      </button>
      <ul className={classNames(styles.navMenu)}>
        {navItem.links &&
          navItem.links.map((item) => (
            <NavItem
              key={item.label + item.href}
              navItem={item}
              closeMenu={closeMenu}
              closeSubmenu={() => setSubmenuOpen(false)}
            />
          ))}
      </ul>
    </li>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);

  const menuIcon = (
    <svg
      className={classNames(styles.menuIcon, { [styles.open]: menuOpen })}
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      viewBox="0 0 122.88 95.95"
    >
      <path
        d="M8.94 0h105c4.92 0 8.94 4.02 8.94 8.94s-4.02 8.94-8.94 8.94h-105C4.02 17.88 0 13.86 0 8.94S4.02 0 8.94 0zm0 78.07h105c4.92 0 8.94 4.02 8.94 8.94s-4.02 8.94-8.94 8.94h-105C4.02 95.95 0 91.93 0 87.01s4.02-8.94 8.94-8.94zm0-39.04h105c4.92 0 8.94 4.02 8.94 8.94s-4.02 8.94-8.94 8.94h-105C4.02 56.91 0 52.89 0 47.97c0-4.91 4.02-8.94 8.94-8.94z"
        style={{
          fillRule: "evenodd",
          clipRule: "evenodd",
        }}
      />
    </svg>
  );

  useBreakpoint({
    breakpoint: breakpoint,
    active: menuOpen,
    onAbove: closeMenu,
  });

  useEffect(() => {
    if (menuOpen && menuRef.current && createFocusTrap) {
      const focusTrap = createFocusTrap(menuRef.current, {
        escapeDeactivates: true,
        clickOutsideDeactivates: true,
        onDeactivate: () => {
          if (menuOpen) closeMenu();
        },
      });
      focusTrap.activate();
      return () => {
        focusTrap.deactivate();
      };
    }
  }, [menuOpen]);

  //For opening / closing mobile menu
  function toggleMenu() {
    if (menuClosing) return;
    menuOpen ? closeMenu() : openMenu();
  }

  //Opens the menu
  function openMenu() {
    setMenuClosing(false);
    setMenuOpen(true);
    document.body.style.overflow = "hidden";
  }

  //Closes the menu
  function closeMenu() {
    setMenuClosing(true);
    document.body.style.overflow = "";
    setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 150);
  }

  return (
    <nav className={styles.navbar} aria-label="Main">
      <button
        className={styles.menuButton}
        onClick={toggleMenu}
        aria-label="Toggle Menu"
        aria-expanded={menuOpen ? "true" : "false"}
      >
        {menuIcon}
      </button>
      <div
        className={classNames(
          styles.navMenuContainer,
          { [styles.open]: menuOpen },
          { [styles.closing]: menuClosing }
        )}
      >
        <ul
          ref={menuRef}
          className={classNames(
            styles.navMenu,
            { [styles.open]: menuOpen },
            { [styles.closing]: menuClosing }
          )}
        >
          {navItems.map((item) => (
            <NavItem
              key={item.label + item.href}
              navItem={item}
              closeMenu={closeMenu}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}
