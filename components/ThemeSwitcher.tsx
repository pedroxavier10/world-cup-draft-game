"use client";
import { useEffect, useState } from "react";

// Floating light/dark toggle, fixed to the top-right corner.

type Mode = "dark" | "light";

export default function ThemeSwitcher() {
  const [mode, setMode] = useState<Mode>("dark");

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  return (
    <div className="theme-switcher">
      <button
        className="ts-toggle"
        onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))}
        title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        aria-label="Toggle light/dark mode"
      >
        {mode === "dark" ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
