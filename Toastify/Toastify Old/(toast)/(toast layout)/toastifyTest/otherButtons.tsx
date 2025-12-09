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
        text="Error! Error!"
        onClick={() => createToast("error", "You messed something up!")}
        style={{ backgroundColor: "brown" }}
      />
      <Button
        variant="primary"
        text="Add Warning"
        onClick={() => {
          createToast("info", "Here is some information.", undefined, false);
        }}
      />
      <Button
        variant="primary"
        text="Another Success "
        onClick={() => {
          createToast("success", "We succeeded again!");
        }}
        style={{ backgroundColor: "darkolivegreen" }}
      />
    </div>
  );
}
