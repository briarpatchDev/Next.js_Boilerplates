import { createToast } from "./createToast";
import { toast } from "react-toastify";
import TempToast from "./tempToast";
import Toast from "./Toast/toast";

function makeToast() {
  createToast(
    Toast,
    "success",
    "It worked!",
    `That thing just worked as we expected it to!`,
    false,
    undefined
  );
  // This is usually wanted after creating a toast (afaik)
  toast.clearWaitingQueue();
}

function makeTempToast() {
  createToast(
    TempToast,
    "",
    "Toast Title",
    `This is a simple toast`,
    true,
    2000
  );
  toast.clearWaitingQueue();
}

// Gets rid of all the open toasts
toast.dismiss();
