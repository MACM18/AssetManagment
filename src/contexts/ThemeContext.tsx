"use client";

// NOTE: Theme system removed. This stub keeps imports compiling without
// changing the rest of the app. It performs no side effects and always
// returns a light theme with a no-op toggle.
import { createContext, useContext } from "react";

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
  return <>{children}</>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
