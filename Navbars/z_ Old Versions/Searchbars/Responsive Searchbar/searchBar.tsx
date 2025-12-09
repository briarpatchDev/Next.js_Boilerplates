"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./searchBar.module.css";
import { debounce } from "lodash";
import { useClickOff } from "@/app/hooks/useClickOff";
import { useBreakpoint } from "@/app/hooks/useBreakpoint";
import { useFocus } from "@/app/hooks/useFocus";
import classNames from "classnames";
import { useFormUpdater } from "@/app/hooks/useFormUpdater";

const searchIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    className={styles.searchIcon}
    viewBox="0 0 119.828 122.88"
  >
    <path d="M48.319 0C61.662 0 73.74 5.408 82.484 14.152s14.152 20.823 14.152 34.166c0 12.809-4.984 24.451-13.117 33.098.148.109.291.23.426.364l34.785 34.737a3.723 3.723 0 0 1-5.25 5.28L78.695 87.06a3.769 3.769 0 0 1-.563-.715 48.116 48.116 0 0 1-29.814 10.292c-13.343 0-25.423-5.408-34.167-14.152C5.408 73.741 0 61.661 0 48.318s5.408-25.422 14.152-34.166C22.896 5.409 34.976 0 48.319 0zm28.763 19.555c-7.361-7.361-17.53-11.914-28.763-11.914s-21.403 4.553-28.764 11.914c-7.361 7.361-11.914 17.53-11.914 28.763s4.553 21.403 11.914 28.764c7.36 7.361 17.53 11.914 28.764 11.914 11.233 0 21.402-4.553 28.763-11.914 7.361-7.36 11.914-17.53 11.914-28.764 0-11.233-4.553-21.402-11.914-28.763z" />
  </svg>
);

const leftArrow = (
  <svg
    className={styles.arrowIcon}
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    imageRendering="optimizeQuality"
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
    viewBox="0 0 512 404.43"
  >
    <path
      fillRule="nonzero"
      d="m68.69 184.48 443.31.55v34.98l-438.96-.54 173.67 159.15-23.6 25.79L0 199.94 218.6.02l23.6 25.79z"
    />
  </svg>
);

// A basic search bar
export default function SearchBar() {
  //Refs
  const componentRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  //Mobile Menu
  const [menuOpen, setMenuOpen] = useState(false);

  // State for search form data
  const [formData, setFormData] = useState({ search: "" });
  const handleChange = useFormUpdater(setFormData);

  //Search suggestions that appear below searchbar
  const [suggestions, setSuggestions] = useState<JSX.Element | null>(null);

  // Removes suggestions if input isn't clicked on
  useClickOff({
    ref: inputRef,
    onClickOff: () => setSuggestions(null),
    active: suggestions !== null,
  });

  //Closes the mobile menu if component isn't clicked on
  useClickOff({
    ref: componentRef,
    onClickOff: () => setMenuOpen(false),
    active: menuOpen,
  });

  //Give focus to the input when you open the mobile menu
  useFocus({
    ref: inputRef,
    active: menuOpen,
  });

  //Debounce for autocomplete suggestions
  const debounceUpdateSuggestions = useCallback(
    debounce(() => updateSuggestions(), 250),
    [formData.search]
  );
  //Updates the suggestions after user types
  useEffect(() => {
    debounceUpdateSuggestions();
    return debounceUpdateSuggestions.cancel;
  }, [formData]);

  //Update the autocomplete suggesstions
  async function updateSuggestions() {
    if (formData.search.trim()) {
      try {
        const options = {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        };
        const res = await fetch(
          `/api/search/suggestions/${encodeURIComponent(formData.search)}`,
          options
        );
        const data = await res.json();
        if (data.suggestions) {
          setSuggestions(
            <ul
              className={styles.suggestions}
              role="listbox"
              aria-label="Search suggestions"
            >
              {data.suggestions.map(
                ({ label, href }: { label: string; href: string }) => (
                  <li key={href} className={styles.suggestion}>
                    <Link href={href}>
                      {searchIcon}
                      {label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          );
        } else {
          setSuggestions(null);
        }
      } catch {
        setSuggestions(null);
      }
    } else {
      setSuggestions(null);
    }
  }

  //Sends user to our search page with their query
  function search(e: React.FormEvent) {
    e.preventDefault();
    setSuggestions(null);
    if (formData.search.trim()) {
      redirect(`/search?q=${encodeURIComponent(formData.search)}`);
    }
  }

  return (
    <div
      className={classNames(styles.searchBar, { [styles.menuOpen]: menuOpen })}
      ref={componentRef}
    >
      <button
        className={classNames(styles.openButton, {
          [styles.menuOpen]: menuOpen,
        })}
        aria-label="Open Search Menu"
        onClick={() => {
          setMenuOpen(true);
        }}
      >
        {searchIcon}
      </button>
      <div
        className={classNames(styles.searchMenuContainer, {
          [styles.menuOpen]: menuOpen,
        })}
      >
        <button
          className={classNames(styles.closeButton, {
            [styles.menuOpen]: menuOpen,
          })}
          aria-label="Close Search Menu"
          onClick={() => {
            setMenuOpen(false);
            setSuggestions(null);
          }}
        >
          {leftArrow}
        </button>
        <form
          className={styles.searchForm}
          onSubmit={search}
          onFocus={() => setMenuOpen(true)}
          onChange={handleChange}
        >
          <input
            ref={inputRef}
            name="search"
            type="input"
            maxLength={256}
            value={formData.search}
            placeholder="Search"
            aria-label="Search"
            onFocus={updateSuggestions}
          />
          <button type="submit" role="submit" aria-label="Search">
            {searchIcon}
          </button>
          {suggestions}
        </form>
      </div>
    </div>
  );
}
