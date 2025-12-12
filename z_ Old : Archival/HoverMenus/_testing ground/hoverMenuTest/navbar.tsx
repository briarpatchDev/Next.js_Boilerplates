"use client";
import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import HoverMenu from "@/app/ui/HoverMenus/HoverMenu 3/hoverMenu";
import Card from "@/app/ui/Cards/Basic Card 1/card";

const cards = [
  <Card
    height="35.0rem"
    width="30.0rem"
    src="/images/cards/boat2.png"
    alt="A large sailboat in cold arctic water."
    headline="Arctic Cruises"
    description="Embark on the adventure of a lifetime! Explore breathtaking Arctic landscapes, majestic glaciers, and diverse wildlife aboard our luxury cruises."
    button={<button>{"Learn More"}</button>}
  />,
  <Card
    height="35.0rem"
    width="30.0rem"
    src="/images/cards/hamburger2.png"
    alt="The Sesame Sizzle Burger"
    headline="The Sesame Sizzle"
    description={`A juicy beef patty, melted cheddar, crisp lettuce, fresh tomato, and our signature Zesty House Sauce on a toasted sesame bun. Bold flavor in every bite! A juicy beef patty, melted cheddar, crisp lettuce, fresh tomato, and our signature Zesty House Sauce on a toasted sesame bun. Bold flavor in every bite! A juicy beef patty, melted cheddar, crisp lettuce, fresh tomato, and our signature Zesty House Sauce on a toasted sesame bun. Bold flavor in every bite!`}
    button={<button>{"Add to Bag"}</button>}
  />,
  <Card
    height="35.0rem"
    width="30.0rem"
    src="/images/cards/laptop2.png"
    alt="An image of the Shimmerline Pro laptop against a white background."
    headline="Shimmerline Pro"
    description="Slim, powerful, and versatile. The Shimmerline Pro features a sharp display, fast performance, and all-day battery life. Perfect for work or play."
    button={<button>{"Learn More"}</button>}
  />,
  <Card
    height="35.0rem"
    width="30.0rem"
    src="/images/cards/candle.jpg"
    alt="A lit lavender candle next to a piece of lavender and wax crystals."
    headline="Lavender Candle"
    description="One of the best know aromatherapy scents for relaxation is lavender. That’s because lavender is a scent that naturally promotes calm. So if you had a stressful day, kick off your shoes, turn on some soothing music, and light a lavender candle. The scent will help relax you, could improve your mood, and help reduce anxiety."
    button={<button>{"Add to Bag"}</button>}
  />,
  <Card
    height="35.0rem"
    width="30.0rem"
    src="/images/cards/coffeeCup.png"
    alt="A stainless steel coffee cup filled with coffee on a stainless steel plate."
    headline="Stainless Steel Coffee Cup"
    description="You will never again have to superglue the broken handle back on your favorite coffee mug because now your favorite coffee mug will be made of indestructible, insulated stainless steel. With our insulated coffee cup, you can ensure that any coffee, cocoa, or cuppa stays hot all morning!"
    button={<button>{"Add to Bag"}</button>}
  />,
  <Card
    height="35.0rem"
    width="30.0rem"
    src="/images/cards/hamburger2.png"
    alt="The Sesame Sizzle Burger"
    headline="The Sesame Sizzle"
    description="A juicy beef patty, melted cheddar, crisp lettuce, fresh tomato, and our signature Zesty House Sauce on a toasted sesame bun. Bold flavor in every bite!"
    button={<button>{"Add to Bag"}</button>}
  />,
  <Card
    height="35.0rem"
    width="30.0rem"
    src="/images/cards/boat2.png"
    alt="A large sailboat in cold arctic water."
    headline="Arctic Cruises"
    description="Embark on the adventure of a lifetime! Explore breathtaking Arctic landscapes, majestic glaciers, and diverse wildlife aboard our luxury cruises."
    button={<button>{"Learn More"}</button>}
  />,
  <Card
    height="35.0rem"
    width="30.0rem"
    src="/images/cards/laptop2.png"
    alt="An image of the Shimmerline Pro laptop against a white background."
    headline="Shimmerline Pro"
    description="Slim, powerful, and versatile. The Shimmerline Pro features a sharp display, fast performance, and all-day battery life. Perfect for work or play."
    button={<button>{"Learn More"}</button>}
  />,
];

export default function Navbar() {
  const pathName: string = usePathname();
  const item1Ref = useRef<null | HTMLLIElement>(null);
  const item2Ref = useRef<null | HTMLLIElement>(null);
  const item3Ref = useRef<null | HTMLLIElement>(null);
  const item4Ref = useRef<null | HTMLLIElement>(null);
  const item5Ref = useRef<null | HTMLLIElement>(null);
  const item6Ref = useRef<null | HTMLLIElement>(null);
  const item7Ref = useRef<null | HTMLLIElement>(null);
  const item8Ref = useRef<null | HTMLLIElement>(null);

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navMenu}>
        <div className={styles.navItemContainer}>
          <li
            className={classNames(styles.navItem, {
              [styles.active]: pathName === "/cruises",
            })}
            ref={item1Ref}
          >
            <Link href="/">Cruise</Link>
            <HoverMenu
              parentRef={item1Ref}
              content={cards[0]}
              direction="bottom"
              shift="middle"
            />
          </li>
          <li
            className={classNames(styles.navItem, {
              [styles.active]: pathName === "/store/burgers",
            })}
            ref={item2Ref}
          >
            <Link href="/about">Burger</Link>
            <HoverMenu
              parentRef={item2Ref}
              content={cards[1]}
              direction="top"
              shift="right"
              offset={1.0}
            />
          </li>
          <li
            className={classNames(styles.navItem, {
              [styles.active]: pathName === "/store/laptops",
            })}
            ref={item3Ref}
          >
            <Link href="/forum">Laptop</Link>
            <HoverMenu
              parentRef={item3Ref}
              content={cards[2]}
              direction="bottom"
              shift="left"
              offset={2.0}
            />
          </li>
          <li
            className={classNames(styles.navItem, {
              [styles.active]: pathName === "/store/candles",
            })}
            ref={item4Ref}
          >
            <Link href="/store">Candle</Link>
            <HoverMenu
              parentRef={item4Ref}
              content={cards[3]}
              direction="top"
              shift="right"
              arrow={true}
              arrowLength={2.0}
              arrowWidth={1.0}
              arrowPosition="left"
              backgroundColor="white"
              centeredArrow={false}
              shiftAmount={3.0}
            />
          </li>
        </div>
        <div className={styles.navItemContainer}>
          <li
            className={classNames(styles.navItem, {
              [styles.active]: pathName === "/store/coffee",
            })}
            ref={item5Ref}
          >
            <Link href="/games">Coffee</Link>
            <HoverMenu
              parentRef={item5Ref}
              content={cards[4]}
              direction="bottom"
              shift="left"
              arrow={true}
              arrowLength={2.0}
              arrowWidth={1.0}
              arrowPosition="right"
              backgroundColor="white"
              centeredArrow={false}
              shiftAmount={3.0}
            />
          </li>
          <li
            className={classNames(styles.navItem, {
              [styles.active]: pathName === "/store/burgers",
            })}
            ref={item6Ref}
          >
            <Link href="/contact">Burger</Link>
            <HoverMenu
              parentRef={item6Ref}
              content={cards[5]}
              direction="right"
              shift="top"
              arrow={true}
              arrowLength={2.0}
              arrowWidth={1.0}
              arrowPosition="bottom"
              backgroundColor="white"
              centeredArrow={true}
            />
          </li>
          <li
            className={classNames(styles.navItem, {
              [styles.active]: pathName === "/cruises",
            })}
            ref={item7Ref}
          >
            <Link href="/extras">Cruise</Link>
            <HoverMenu
              parentRef={item7Ref}
              content={cards[6]}
              direction="bottom"
              shift="middle"
            />
          </li>
          <li
            className={classNames(styles.navItem, {
              [styles.active]: pathName === "/store/laptops",
            })}
            ref={item8Ref}
          >
            <Link href="/login">Laptop</Link>
            <HoverMenu
              parentRef={item8Ref}
              content={cards[7]}
              direction="top"
              shift="middle"
            />
          </li>
        </div>
      </ul>
    </nav>
  );
}
