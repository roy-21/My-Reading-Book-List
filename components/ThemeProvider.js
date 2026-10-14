"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to Day / Light Mode" : "Switch to Night / Dark Mode"}
      title={theme === "dark" ? "Day Mode" : "Night Mode"}
      className="p-2 rounded-lg border border-color bg-surface text-muted hover:text-main hover:border-indigo-500/30 transition-all flex items-center justify-center cursor-pointer"
      style={{ width: 34, height: 34 }}
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun size={15} className="text-amber-400" />
        ) : (
          <Moon size={15} className="text-indigo-400" />
        )
      ) : (
        <span style={{ width: 15, height: 15, display: "inline-block" }} />
      )}
    </button>
  );
}
