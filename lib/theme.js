import { useState, useEffect } from "react";

const KEY = "ghstats_theme";

export function useTheme() {
  const [theme, setTheme] = useState("blue");

  useEffect(() => {
    let saved = "blue";
    try { saved = localStorage.getItem(KEY) || "blue"; } catch {}
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = theme === "blue" ? "amber" : "blue";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch {}
  };

  return [theme, toggle];
}
