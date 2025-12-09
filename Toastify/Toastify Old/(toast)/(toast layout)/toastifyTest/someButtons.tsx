"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/app/ui/Buttons/Button Set 1/button";
import { createToast } from "@/app/functions/createToast";

export default function Component() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: ".6rem",
      }}
    >
      <Button
        variant="primary"
        text="Add Success Toast"
        onClick={() => createToast("success", "A toast! Cheers!")}
        style={{backgroundColor: "darkolivegreen"}}
      />
      <Button
        variant="primary"
        text="Add Warning"
        onClick={() => {
          createToast(
            "warning",
            "This toast won't go away on its own.",
            undefined,
            false
          );
        }}
        style={{backgroundColor: "goldenrod"}}
      />
      <Button
        variant="primary"
        text="Some News"
        onClick={() =>
          createToast("news", "We have a new feature. Check it out!")
        }
        style={{backgroundColor: "grey"}}
      />
    </div>
  );
}
