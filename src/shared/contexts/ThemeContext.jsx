/*
|--------------------------------------------------------------------------
| ThemeContext.jsx
|--------------------------------------------------------------------------
|
| Manages light/dark theme preference across the app.
|
| Purpose: Persists theme to localStorage and syncs `dark` class on <html>.
| Inputs: children (ReactNode)
| Outputs: Renders ThemeContext.Provider wrapping children
| Side effects: Reads/writes localStorage; adds/removes classList on documentElement
|
|--------------------------------------------------------------------------
*/

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

/**
 * Resolve the initial theme on page load.
 *
 * Priority: localStorage > OS preference > fallback to "light".
 *
 * @returns {"light" | "dark"}
 */
function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * ThemeProvider — React context provider for theme state.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Sync the dark class on <html> and persist to localStorage whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme and toggle function.
 *
 * Must be used inside a <ThemeProvider>.
 *
 * @returns {{ theme: "light" | "dark", toggleTheme: Function }}
 * @throws {Error} If used outside a ThemeProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
