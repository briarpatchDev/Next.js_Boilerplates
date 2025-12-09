"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import styles from "./modal.module.css";
import { FocusTrap } from "focus-trap-react";

/* A flexible modal component that displays inputed content
 * children - the content that will be on the modal
 * closeFunction - a function from the parent used to close the modal there
 */
interface ModalProps {
  children: React.ReactNode;
  closeFunction: () => void;
}

export default function Modal({ children, closeFunction }: ModalProps) {
  //Closes the modal when user hits ESC
  const escapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeFunction();
      }
    },
    [closeFunction]
  );

  //Adds a keydown listener for escapeKey, and prevents the page from scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", escapeKey, true);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", escapeKey, true);
    };
  }, [escapeKey]);

  //Closes the modal on click: for the backdrop and other buttons
  function closeModal(event: React.MouseEvent): void {
    if (event.target === event.currentTarget) {
      closeFunction();
    }
  }

  return (
    <FocusTrap>
      <div className={styles.backdrop} /* onClick={closeModal} */>
        <div className={styles.modal} role="dialog" aria-modal="true">
          <button
            className={styles.closeButton}
            onClick={closeModal}
            aria-label={"Close Modal"}
          >
            <svg
              id="close-icon"
              viewBox="0 0 122.878 122.88"
              className={styles.closeIcon}
            >
              <path d="M1.426,8.313c-1.901-1.901-1.901-4.984,0-6.886c1.901-1.902,4.984-1.902,6.886,0l53.127,53.127l53.127-53.127 c1.901-1.902,4.984-1.902,6.887,0c1.901,1.901,1.901,4.985,0,6.886L68.324,61.439l53.128,53.128c1.901,1.901,1.901,4.984,0,6.886 c-1.902,1.902-4.985,1.902-6.887,0L61.438,68.326L8.312,121.453c-1.901,1.902-4.984,1.902-6.886,0 c-1.901-1.901-1.901-4.984,0-6.886l53.127-53.128L1.426,8.313L1.426,8.313z" />
            </svg>
          </button>
          {children}
        </div>
      </div>
    </FocusTrap>
  );
}
