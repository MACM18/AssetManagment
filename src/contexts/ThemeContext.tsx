"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  // Initialize theme on mount. Add a temporary no-transition class to avoid
  // abrupt transitions during initial paint or when applying the saved
  // preference.
  useEffect(() => {
    const root = document.documentElement;
    // Prevent transitions during initial theme setup
    root.classList.add("no-transition");

    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      if (savedTheme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
      root.classList.add("dark");
    } else {
      setTheme("light");
      root.classList.remove("dark");
    }

    // Remove the no-transition helper on the next animation frame so
    // normal transitions can occur afterwards.
    requestAnimationFrame(() => {
      setTimeout(() => root.classList.remove("no-transition"), 50);
    });

    setMounted(true);

    // If the user has not explicitly chosen a theme, listen for system
    // preference changes and update the theme accordingly.
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem("theme");
      if (saved) return; // respect explicit user choice
      const root = document.documentElement;
      root.classList.add("no-transition");
      if (e.matches) {
        setTheme("dark");
        root.classList.add("dark");
      } else {
        setTheme("light");
        root.classList.remove("dark");
      }
      requestAnimationFrame(() => root.classList.remove("no-transition"));
    };

    if (mql && mql.addEventListener)
      mql.addEventListener("change", handleChange);

    return () => {
      if (mql && mql.removeEventListener)
        mql.removeEventListener("change", handleChange);
    };
  }, []);

  // Apply theme changes and persist selection. Briefly disable transitions
  // during the switch to avoid jarring animations.
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.add("no-transition");
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
    // remove no-transition in the next frame
    requestAnimationFrame(() => root.classList.remove("no-transition"));
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isDark: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
