"use client";
import { toast, cssTransition } from "react-toastify";
import React from "react";

// Types for toast component props
export interface ToastComponentProps {
  type: string;
  title?: string;
  message?: string;
  autoClose: boolean;
  closeFunction?: () => void;
  duration: number;
}

type ToastComponent = React.ComponentType<ToastComponentProps>;

/*
 *   Component - an inputed toast component that handles the UI
 *   type - the type of message being sent (come in different color schemes)
 *   message - the message on the toast
 *   closeFunction - a function the closes the toast, typically used by toastify
 *   title - optional title that overrides our default titles, leave as undefined otherwise
 *   autoClose - toast will autoClose after the duration expire
 *   duration - the time in ms before toast autoCloses
 */
function createToast(
  Component: ToastComponent,
  type: string,
  title?: string,
  message?: string,
  autoClose = true,
  duration = 3000
) {
  toast(
    ({ closeToast }) => {
      return (
        <Component
          type={type}
          message={message}
          title={title}
          icon={icon}
          autoClose={autoClose}
          closeFunction={closeToast}
          duration={duration}
        />
      );
    },
    {
      autoClose: autoClose ? duration : false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      hideProgressBar: true,
      closeButton: false,
      style: {
        width: "max-content",
        height: "max-content",
        boxShadow: "none",
        padding: "0",
        margin: "0",
        background: "none",
      },
      //position: "top-center",
    }
  );
}

export { createToast };
