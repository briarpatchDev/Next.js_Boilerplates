import ToastComponent from "@/app/ui/Toast/toast";
import { toast } from "react-toastify";

/*
 *   type - the type of message being sent (come in different color schemes)
 *   message - the message on the toast
 *   closeFunction - a function the closes the toast, typically used by toastify
 *   title - optional title that overrides our default titles, leave as undefined otherwise
 *   autoClose - toast will autoClose after the duration expire
 *   duration - the time in ms before toast autoCloses
 */
function createToast(
  type: "success" | "warning" | "error" | "info" | "news",
  message: string,
  title?: string,
  autoClose = true,
  duration = 5000
) {
  toast(
    ({ closeToast }) => (
      <ToastComponent
        type={type}
        message={message}
        title={title}
        autoClose={false}
        closeFunction={closeToast}
      />
    ),
    {
      autoClose: autoClose ? duration : false,
      closeOnClick: false,
      pauseOnHover: true,
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
      position: "bottom-center",
    }
  );
}

export { createToast };
