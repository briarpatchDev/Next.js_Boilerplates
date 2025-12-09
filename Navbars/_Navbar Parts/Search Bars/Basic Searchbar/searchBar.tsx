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

// A basic search bar
export default function SearchBar() {
  // State for form data and errors
  const [formData, setFormData] = useState({ search: "" });
  const [suggestions, setSuggestions] = useState<JSX.Element | null>(null);
  const componentRef = useRef<HTMLDivElement | null>(null);

  // Removes suggestions if components not clicked on
  const handleClick = useCallback((e: MouseEvent) => {
    if (
      componentRef.current &&
      !componentRef.current.contains(e.target as Node)
    ) {
      setSuggestions(null);
    }
  }, []);

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

  //Adds a click-off to suggestions
  useEffect(() => {
    suggestions
      ? document.addEventListener("click", handleClick, true)
      : document.removeEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [suggestions]);

  // Handle input changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  }

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
    if (formData.search.trim()) {
      redirect(`/search?q=${encodeURIComponent(formData.search)}`);
    }
  }

  return (
    <div className={styles.searchBar} ref={componentRef}>
      <form className={styles.searchForm} onSubmit={search}>
        <input
          name="search"
          type="input"
          maxLength={256}
          value={formData.search}
          onChange={handleChange}
          placeholder="Search"
          aria-label="Search"
          onClick={updateSuggestions}
        />
        <button type="submit" role="submit" aria-label="Search">
          {searchIcon}
        </button>
      </form>
      {suggestions}
    </div>
  );
}
