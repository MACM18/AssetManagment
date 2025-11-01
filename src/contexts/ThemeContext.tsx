"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  // Apply theme to document
  const applyTheme = (themeToApply: "light" | "dark") => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove("light", "dark");

    // Add the new theme class
    root.classList.add(themeToApply);

    setActualTheme(themeToApply);

    console.log("Theme applied:", themeToApply, "Classes:", root.className);
  };

  // Set theme and save to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "system") {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(newTheme);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);

    // Get saved theme or default to system
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const themeToUse = savedTheme || "system";

    console.log("Initializing theme:", themeToUse);

    setThemeState(themeToUse);

    // Apply initial theme
    if (themeToUse === "system") {
      const systemTheme = getSystemTheme();
      console.log("System theme detected:", systemTheme);
      applyTheme(systemTheme);
    } else {
      console.log("Applying saved theme:", themeToUse);
      applyTheme(themeToUse);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeToUse === "system") {
        const newSystemTheme = getSystemTheme();
        console.log("System theme changed to:", newSystemTheme);
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update when theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme(getSystemTheme());
      }
    };

    if (theme === "system") {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(theme);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mounted]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme,
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
